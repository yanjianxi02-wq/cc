-- 达人选品罗盘：只读分析层。
-- Apply after supabase-task-workflow-migration.sql.
-- This migration does not change creator task-product access, RLS, or historical selections.

begin;

-- All heat labels use this central configuration. Adjust thresholds here only.
create or replace function public.selection_compass_thresholds()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'recent_activity_days', 30,
    'high_heat_min_assigned_creators', 3,
    'high_heat_min_selection_rate', 0.50,
    'high_heat_min_featured_rate', 0.25,
    'broad_selection_min_rate', 0.50,
    'niche_max_selection_rate', 0.35,
    'niche_min_top3_count', 2,
    'brand_bias_min_assigned_creators', 3,
    'brand_bias_max_selection_rate', 0.20,
    'potential_min_selected_creators', 3,
    'potential_min_featured_rate', 0.20
  );
$$;

create or replace function public.selection_compass_price_band(p_price numeric)
returns text
language sql
immutable
as $$
  select case
    when p_price is null then '待确认'
    when p_price <= 50 then '1-50元'
    when p_price <= 100 then '50-100元'
    when p_price <= 300 then '100-300元'
    when p_price <= 500 then '300-500元'
    when p_price <= 1000 then '500-1000元'
    else '1000元以上'
  end;
$$;

create or replace function public.selection_compass_stock_band(p_stock numeric)
returns text
language sql
immutable
as $$
  select case
    when p_stock is null then '待确认'
    when p_stock < 100 then '100件以下'
    when p_stock <= 500 then '100-500件'
    else '500件以上'
  end;
$$;

-- Scores express the creator's subjective ordering only, never sales performance.
create or replace function public.selection_compass_preference_strength(
  p_is_featured boolean,
  p_selection_order integer
)
returns integer
language sql
immutable
as $$
  select 40
    + case when coalesce(p_is_featured, false) then 30 else 0 end
    + case
        when p_selection_order = 1 then 30
        when p_selection_order = 2 then 25
        when p_selection_order = 3 then 20
        when p_selection_order is null then 0
        else greatest(5, 18 - greatest(p_selection_order - 4, 0) * 2)
      end;
$$;

create or replace function public.selection_compass_remark_labels(p_remark text)
returns text[]
language sql
immutable
as $$
  with value as (
    select lower(btrim(coalesce(p_remark, ''))) as text_value
  ), labels as (
    select array_remove(array[
      case when text_value ~ '价格|价位|售价|达播|便宜|太贵|贵|降价|改价|折扣' then '价格' end,
      case when text_value ~ '颜色|色系|色彩|白色|黑色|蓝色|红色|绿色|黄色|紫色|咖色' then '颜色' end,
      case when text_value ~ '版型|显瘦|宽松|修身|廓形|腰线|长度|领口|袖' then '版型' end,
      case when text_value ~ '尺码|码数|大小|s码|m码|l码|xl|身高|体重' then '尺码' end,
      case when text_value ~ '库存|现货|补货|断货|货量|产能|预售' then '库存' end,
      case when text_value ~ '面料|材质|棉|麻|羊毛|针织|真丝|质感' then '面料' end,
      case when text_value ~ '上身|试穿|效果|显高|显白|显瘦' then '上身效果' end,
      case when text_value ~ '搭配|内搭|下装|外套|套装|组合' then '搭配' end,
      case when text_value ~ '图片|主图|详情图|模特图|视觉|拍摄' then '图片' end,
      case when text_value ~ '寄样|样衣|样品' then '寄样' end,
      case when text_value ~ '改价|调价|价格调整' then '改价' end,
      case when text_value ~ '资料|卖点|信息|补充|链接' then '补充资料' end
    ], null) as label_list
    from value
  )
  select case
    when (select text_value from value) = '' then array[]::text[]
    when cardinality(label_list) = 0 then array['其他']::text[]
    else label_list
  end
  from labels;
$$;

-- Brand-only overview. Task range is required for all rate calculations.
create or replace function public.get_selection_compass_overview(
  p_creator_query text default null,
  p_task_id uuid default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_category text default null,
  p_confidence text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null or not public.is_brand_admin() then
    raise exception 'brand admin required' using errcode = '42501';
  end if;

  with latest_task_submissions as (
    select distinct on (submission.creator_user_id, submission.task_id)
      submission.id,
      submission.creator_user_id,
      submission.task_id,
      submission.submitted_at,
      submission.item_count
    from public.submissions as submission
    where submission.creator_user_id is not null
      and submission.task_id is not null
    order by submission.creator_user_id, submission.task_id, submission.submitted_at desc, submission.id desc
  ), task_assignments as (
    select
      assignment.creator_user_id,
      task.id as task_id,
      task.title as task_title,
      task.created_at as task_created_at,
      task.recommended_count,
      count(task_product.sku)::integer as task_product_count
    from public.selection_task_assignments as assignment
    join public.selection_tasks as task on task.id = assignment.task_id
    left join public.selection_task_products as task_product on task_product.task_id = task.id
    where (p_task_id is null or task.id = p_task_id)
      and (p_date_from is null or task.created_at >= p_date_from)
      and (p_date_to is null or task.created_at < p_date_to + interval '1 day')
    group by assignment.creator_user_id, task.id, task.title, task.created_at, task.recommended_count
  ), submitted_tasks as (
    select
      assignment.*,
      submission.id as submission_id,
      submission.submitted_at
    from task_assignments as assignment
    join latest_task_submissions as submission
      on submission.creator_user_id = assignment.creator_user_id
     and submission.task_id = assignment.task_id
  ), selected_items as (
    select
      submitted.creator_user_id,
      submitted.task_id,
      submitted.submission_id,
      submitted.submitted_at,
      item.sku,
      item.category,
      item.style,
      item.plan_level,
      item.price,
      item.is_featured,
      item.selection_order,
      item.remark
    from submitted_tasks as submitted
    join public.selection_items as item on item.submission_id = submitted.submission_id
  ), filtered_selected_items as (
    select item.*
    from selected_items as item
    where p_category is null or p_category = '' or item.category = p_category
  ), creator_task_metrics as (
    select
      profile.user_id,
      profile.creator_name,
      count(distinct assignment.task_id)::integer as assigned_task_count,
      count(distinct submitted.task_id)::integer as submitted_task_count,
      coalesce(sum(submitted.task_product_count), 0)::integer as available_sample_count,
      max(submitted.submitted_at) as latest_submission_at
    from public.creator_profiles as profile
    left join task_assignments as assignment on assignment.creator_user_id = profile.user_id
    left join submitted_tasks as submitted on submitted.creator_user_id = profile.user_id and submitted.task_id = assignment.task_id
    where profile.status = 'active'
      and (p_creator_query is null or btrim(p_creator_query) = '' or profile.creator_name ilike '%' || btrim(p_creator_query) || '%')
    group by profile.user_id, profile.creator_name
  ), creator_selection_metrics as (
    select
      selected.creator_user_id,
      count(distinct selected.submission_id)::integer as selection_submission_count,
      count(selected.sku)::integer as selected_count,
      count(selected.sku) filter (where selected.is_featured)::integer as featured_count
    from filtered_selected_items as selected
    group by selected.creator_user_id
  ), creator_metrics as (
    select
      task_metrics.*,
      coalesce(selection_metrics.selection_submission_count, 0) as selection_submission_count,
      coalesce(selection_metrics.selected_count, 0) as selected_count,
      coalesce(selection_metrics.featured_count, 0) as featured_count
    from creator_task_metrics as task_metrics
    left join creator_selection_metrics as selection_metrics on selection_metrics.creator_user_id = task_metrics.user_id
  ), creator_dimension_rows as (
    select creator_user_id, 'category'::text as dimension, coalesce(nullif(category, ''), '未标注') as label, count(*)::integer as item_count
    from filtered_selected_items
    group by creator_user_id, coalesce(nullif(category, ''), '未标注')
    union all
    select creator_user_id, 'price_band'::text, public.selection_compass_price_band(price), count(*)::integer
    from filtered_selected_items
    group by creator_user_id, public.selection_compass_price_band(price)
    union all
    select creator_user_id, 'style'::text, coalesce(nullif(style, ''), '未标注'), count(*)::integer
    from filtered_selected_items
    group by creator_user_id, coalesce(nullif(style, ''), '未标注')
  ), creator_dimension_ranked as (
    select
      *,
      row_number() over (partition by creator_user_id, dimension order by item_count desc, label) as rank_no
    from creator_dimension_rows
  ), creator_dimensions as (
    select
      creator_user_id,
      max(label) filter (where dimension = 'category' and rank_no = 1) as core_category,
      max(label) filter (where dimension = 'price_band' and rank_no = 1) as core_price_band,
      max(label) filter (where dimension = 'style' and rank_no = 1) as core_style
    from creator_dimension_ranked
    group by creator_user_id
  ), recommendation_scope as (
    select
      submitted.creator_user_id,
      submitted.submission_id,
      task_product.sku,
      coalesce(override.creator_sort_priority, product.creator_sort_priority) is not null as is_brand_recommended
    from submitted_tasks as submitted
    join public.selection_task_products as task_product on task_product.task_id = submitted.task_id
    join public.product_catalog as product on product.sku = task_product.sku
    left join public.product_overrides as override on override.sku = product.sku
  ), recommendation_metrics as (
    select
      scope.creator_user_id,
      count(*) filter (where scope.is_brand_recommended)::integer as brand_recommended_available_count,
      count(*) filter (where scope.is_brand_recommended and selected.sku is not null)::integer as brand_recommended_selected_count
    from recommendation_scope as scope
    left join filtered_selected_items as selected
      on selected.submission_id = scope.submission_id
     and selected.sku = scope.sku
    group by scope.creator_user_id
  ), creator_rows as (
    select
      metrics.*,
      dimensions.core_category,
      dimensions.core_price_band,
      dimensions.core_style,
      coalesce(recommendation.brand_recommended_available_count, 0) as brand_recommended_available_count,
      coalesce(recommendation.brand_recommended_selected_count, 0) as brand_recommended_selected_count,
      case
        when metrics.submitted_task_count < 2 or metrics.available_sample_count < 10 then '数据不足'
        when metrics.submitted_task_count >= 3 and metrics.available_sample_count > 30 then '稳定偏好'
        else '初步倾向'
      end as data_confidence
    from creator_metrics as metrics
    left join creator_dimensions as dimensions on dimensions.creator_user_id = metrics.user_id
    left join recommendation_metrics as recommendation on recommendation.creator_user_id = metrics.user_id
  ), filtered_creators as (
    select *
    from creator_rows
    where p_confidence is null or btrim(p_confidence) = '' or data_confidence = p_confidence
  ), task_submission_count as (
    select count(*)::integer as value from submitted_tasks
  ), selected_detail_count as (
    select count(*)::integer as value from filtered_selected_items
  ), featured_detail_count as (
    select count(*)::integer as value from filtered_selected_items where is_featured
  ), recent_creator_count as (
    select count(distinct creator_user_id)::integer as value
    from selected_items
    where submitted_at >= now() - ((public.selection_compass_thresholds() ->> 'recent_activity_days')::integer * interval '1 day')
  )
  select jsonb_build_object(
    'generated_at', now(),
    'scope_note', '选择率仅基于已分配任务范围计算；无任务范围的历史记录只在详情页作为历史已选分布展示。',
    'summary', jsonb_build_object(
      'approved_creator_count', (select count(*) from public.creator_profiles where status = 'active'),
      'created_task_count', (select count(*) from public.selection_tasks),
      'submitted_task_count', (select value from task_submission_count),
      'valid_selection_item_count', (select value from selected_detail_count),
      'featured_selection_count', (select value from featured_detail_count),
      'average_selection_count', coalesce((select avg(selected_count) from filtered_creators where submitted_task_count > 0), 0),
      'data_insufficient_creator_count', (select count(*) from filtered_creators where data_confidence = '数据不足'),
      'recent_submit_creator_count', (select value from recent_creator_count)
    ),
    'creators', coalesce((
      select jsonb_agg(jsonb_build_object(
        'creator_user_id', user_id,
        'creator_name', creator_name,
        'assigned_task_count', assigned_task_count,
        'submitted_task_count', submitted_task_count,
        'task_completion_rate', case when assigned_task_count = 0 then null else round(submitted_task_count::numeric / assigned_task_count, 4) end,
        'selected_count', selected_count,
        'average_selection_count', case when selection_submission_count = 0 then null else round(selected_count::numeric / selection_submission_count, 2) end,
        'featured_count', featured_count,
        'featured_rate', case when selected_count = 0 then null else round(featured_count::numeric / selected_count, 4) end,
        'core_category', core_category,
        'core_price_band', core_price_band,
        'core_style', core_style,
        'brand_recommendation_hit_rate', case when brand_recommended_available_count = 0 then null else round(brand_recommended_selected_count::numeric / brand_recommended_available_count, 4) end,
        'data_confidence', data_confidence,
        'latest_submission_at', latest_submission_at
      ) order by latest_submission_at desc nulls last, selected_count desc, creator_name)
      from filtered_creators
    ), '[]'::jsonb),
    'filters', jsonb_build_object(
      'tasks', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'title', title) order by created_at desc) from public.selection_tasks), '[]'::jsonb),
      'categories', coalesce((select jsonb_agg(category order by category) from (select distinct category from public.product_catalog where category is not null and category <> '') as categories), '[]'::jsonb)
    )
  ) into v_result;

  return v_result;
end;
$$;

-- Detail for a single creator. Task history is paginated and all item details remain read-only.
create or replace function public.get_creator_selection_compass(
  p_creator_user_id uuid,
  p_task_id uuid default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_history_page integer default 1,
  p_history_page_size integer default 8
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_page integer := greatest(coalesce(p_history_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_history_page_size, 8), 1), 30);
begin
  if auth.uid() is null or not public.is_brand_admin() then
    raise exception 'brand admin required' using errcode = '42501';
  end if;

  if not exists (select 1 from public.creator_profiles where user_id = p_creator_user_id) then
    raise exception 'creator not found' using errcode = 'P0002';
  end if;

  with creator as (
    select user_id, creator_name, email, status
    from public.creator_profiles
    where user_id = p_creator_user_id
  ), latest_task_submissions as (
    select distinct on (submission.creator_user_id, submission.task_id)
      submission.id,
      submission.creator_user_id,
      submission.task_id,
      submission.submitted_at
    from public.submissions as submission
    where submission.creator_user_id = p_creator_user_id
      and submission.task_id is not null
    order by submission.creator_user_id, submission.task_id, submission.submitted_at desc, submission.id desc
  ), task_assignments as (
    select
      task.id as task_id,
      task.title,
      task.description,
      task.due_at,
      task.created_at,
      task.recommended_count,
      count(task_product.sku)::integer as task_product_count
    from public.selection_task_assignments as assignment
    join public.selection_tasks as task on task.id = assignment.task_id
    left join public.selection_task_products as task_product on task_product.task_id = task.id
    where assignment.creator_user_id = p_creator_user_id
      and (p_task_id is null or task.id = p_task_id)
      and (p_date_from is null or task.created_at >= p_date_from)
      and (p_date_to is null or task.created_at < p_date_to + interval '1 day')
    group by task.id, task.title, task.description, task.due_at, task.created_at, task.recommended_count
  ), submitted_tasks as (
    select
      assignment.*,
      submission.id as submission_id,
      submission.submitted_at
    from task_assignments as assignment
    join latest_task_submissions as submission on submission.task_id = assignment.task_id
  ), selected_items as (
    select
      submitted.task_id,
      submitted.submission_id,
      submitted.submitted_at,
      item.sku,
      item.product_name,
      item.category,
      item.style,
      item.plan_level,
      item.price,
      item.image_url,
      item.is_featured,
      item.selection_order,
      item.remark,
      public.selection_compass_preference_strength(item.is_featured, item.selection_order) as preference_strength
    from submitted_tasks as submitted
    join public.selection_items as item on item.submission_id = submitted.submission_id
  ), task_scope as (
    select
      submitted.task_id,
      submitted.submission_id,
      task_product.sku,
      coalesce(nullif(override.style, ''), nullif(product.style, ''), '未标注') as style,
      coalesce(nullif(override.plan_level, ''), nullif(product.plan_level, ''), '未标注') as plan_level,
      coalesce(override.price, product.price) as price,
      coalesce(product.category, '未标注') as category,
      public.selection_compass_stock_band(product.stock) as stock_band,
      coalesce(override.creator_sort_priority, product.creator_sort_priority) is not null as is_brand_recommended
    from submitted_tasks as submitted
    join public.selection_task_products as task_product on task_product.task_id = submitted.task_id
    join public.product_catalog as product on product.sku = task_product.sku
    left join public.product_overrides as override on override.sku = product.sku
  ), dimension_scope as (
    select task_id, submission_id, sku, 'category'::text as dimension, category as label, is_brand_recommended from task_scope
    union all
    select task_id, submission_id, sku, 'price_band'::text, public.selection_compass_price_band(price), is_brand_recommended from task_scope
    union all
    select task_id, submission_id, sku, 'style'::text, style, is_brand_recommended from task_scope
    union all
    select task_id, submission_id, sku, 'plan_level'::text, plan_level, is_brand_recommended from task_scope
    union all
    select task_id, submission_id, sku, 'stock_band'::text, stock_band, is_brand_recommended from task_scope
  ), dimension_stats as (
    select
      scope.dimension,
      scope.label,
      count(*)::integer as available_count,
      count(selected.sku)::integer as selected_count,
      count(selected.sku) filter (where selected.is_featured)::integer as featured_count,
      round(avg(selected.selection_order)::numeric, 2) as average_selection_order,
      count(selected.sku) filter (where selected.selection_order <= 3)::integer as top_three_count
    from dimension_scope as scope
    left join selected_items as selected
      on selected.submission_id = scope.submission_id
     and selected.sku = scope.sku
    group by scope.dimension, scope.label
  ), recommendation_metrics as (
    select
      count(*) filter (where scope.is_brand_recommended)::integer as brand_recommended_available_count,
      count(*) filter (where scope.is_brand_recommended and selected.sku is not null)::integer as brand_recommended_selected_count,
      count(*) filter (where not scope.is_brand_recommended and selected.is_featured)::integer as featured_not_brand_recommended_count,
      count(selected.sku)::integer as total_selected_in_scope
    from task_scope as scope
    left join selected_items as selected
      on selected.submission_id = scope.submission_id
     and selected.sku = scope.sku
  ), task_counts as (
    select
      submitted.task_id,
      count(item.sku)::integer as selected_count,
      count(item.sku) filter (where item.is_featured)::integer as featured_count,
      count(item.sku) filter (where item.selection_order <= 3)::integer as top_three_count,
      round(avg(public.selection_compass_preference_strength(item.is_featured, item.selection_order))::numeric, 1) as average_preference_strength
    from submitted_tasks as submitted
    left join public.selection_items as item on item.submission_id = submitted.submission_id
    group by submitted.task_id
  ), task_history as (
    select
      assignment.*,
      submitted.submission_id,
      submitted.submitted_at,
      coalesce(counts.selected_count, 0) as selected_count,
      coalesce(counts.featured_count, 0) as featured_count,
      coalesce(counts.top_three_count, 0) as top_three_count,
      counts.average_preference_strength,
      row_number() over (order by submitted.submitted_at desc nulls last, assignment.created_at desc) as row_number,
      count(*) over () as total_count
    from task_assignments as assignment
    left join submitted_tasks as submitted on submitted.task_id = assignment.task_id
    left join task_counts as counts on counts.task_id = assignment.task_id
  ), paged_history as (
    select *
    from task_history
    where row_number between ((v_page - 1) * v_page_size + 1) and (v_page * v_page_size)
  ), top_three_traits as (
    select jsonb_build_object(
      'categories', coalesce((select jsonb_agg(label order by count desc, label) from (
        select category as label, count(*)::integer as count from selected_items where selection_order <= 3 group by category order by count desc, category limit 3
      ) as category_traits), '[]'::jsonb),
      'price_bands', coalesce((select jsonb_agg(label order by count desc, label) from (
        select public.selection_compass_price_band(price) as label, count(*)::integer as count from selected_items where selection_order <= 3 group by public.selection_compass_price_band(price) order by count desc, label limit 3
      ) as price_traits), '[]'::jsonb),
      'styles', coalesce((select jsonb_agg(label order by count desc, label) from (
        select coalesce(nullif(style, ''), '未标注') as label, count(*)::integer as count from selected_items where selection_order <= 3 group by coalesce(nullif(style, ''), '未标注') order by count desc, label limit 3
      ) as style_traits), '[]'::jsonb)
    ) as value
  ), overview_metrics as (
    select
      (select count(*) from task_assignments)::integer as assigned_task_count,
      (select count(*) from submitted_tasks)::integer as submitted_task_count,
      (select coalesce(sum(task_product_count), 0) from submitted_tasks)::integer as available_sample_count,
      (select count(*) from selected_items)::integer as selected_count,
      (select count(*) from selected_items where is_featured)::integer as featured_count,
      (select max(submitted_at) from submitted_tasks) as latest_submission_at,
      (select count(*) from submitted_tasks where due_at is not null and submitted_at <= due_at)::integer as on_time_submission_count,
      (select count(*) from submitted_tasks where due_at is not null)::integer as deadline_submission_count,
      (select round(avg(least(task_counts.selected_count::numeric / task.recommended_count, 1))::numeric, 4)
        from submitted_tasks as task
        join task_counts on task_counts.task_id = task.task_id
        where task.recommended_count is not null and task.recommended_count > 0) as recommended_completion_rate
  ), confidence as (
    select case
      when submitted_task_count < 2 or available_sample_count < 10 then '数据不足'
      when submitted_task_count >= 3 and available_sample_count > 30 then '稳定偏好'
      else '初步倾向'
    end as value
    from overview_metrics
  ), experience_seed as (
    select dimension, label, available_count, selected_count, featured_count
    from dimension_stats
    where dimension in ('category', 'price_band', 'style')
      and selected_count > 0
    order by (selected_count::numeric / nullif(available_count, 0)) desc nulls last, selected_count desc, label
    limit 3
  )
  select jsonb_build_object(
    'generated_at', now(),
    'creator', (select jsonb_build_object('user_id', user_id, 'creator_name', creator_name, 'status', status) from creator),
    'disclaimer', '偏好强度只表达达人在单次任务中的主观选择优先级，不代表商品实际销售表现。',
    'overview', (select jsonb_build_object(
      'assigned_task_count', assigned_task_count,
      'submitted_task_count', submitted_task_count,
      'task_completion_rate', case when assigned_task_count = 0 then null else round(submitted_task_count::numeric / assigned_task_count, 4) end,
      'selected_count', selected_count,
      'average_selection_count', case when submitted_task_count = 0 then null else round(selected_count::numeric / submitted_task_count, 2) end,
      'featured_count', featured_count,
      'featured_rate', case when selected_count = 0 then null else round(featured_count::numeric / selected_count, 4) end,
      'brand_recommendation_hit_rate', case when recommendation.brand_recommended_available_count = 0 then null else round(recommendation.brand_recommended_selected_count::numeric / recommendation.brand_recommended_available_count, 4) end,
      'valid_analysis_task_count', submitted_task_count,
      'available_sample_count', available_sample_count,
      'latest_submission_at', latest_submission_at,
      'recommended_completion_rate', recommended_completion_rate,
      'on_time_submission_rate', case when deadline_submission_count = 0 then null else round(on_time_submission_count::numeric / deadline_submission_count, 4) end,
      'data_confidence', confidence.value
    ) from overview_metrics cross join recommendation_metrics cross join confidence),
    'breakdowns', coalesce((select jsonb_object_agg(dimension, records) from (
      select dimension, jsonb_agg(jsonb_build_object(
        'label', label,
        'available_count', available_count,
        'selected_count', selected_count,
        'selection_rate', case when available_count = 0 then null else round(selected_count::numeric / available_count, 4) end,
        'featured_count', featured_count,
        'featured_rate', case when selected_count = 0 then null else round(featured_count::numeric / selected_count, 4) end,
        'average_selection_order', average_selection_order,
        'top_three_count', top_three_count
      ) order by (selected_count::numeric / nullif(available_count, 0)) desc nulls last, selected_count desc, label) as records
      from dimension_stats
      group by dimension
    ) as grouped), '{}'::jsonb),
    'brand_recommendation', (select jsonb_build_object(
      'brand_recommended_available_count', brand_recommended_available_count,
      'brand_recommended_selected_count', brand_recommended_selected_count,
      'brand_recommended_not_selected_count', greatest(brand_recommended_available_count - brand_recommended_selected_count, 0),
      'featured_not_brand_recommended_count', featured_not_brand_recommended_count,
      'direction_overlap_rate', case when total_selected_in_scope = 0 then null else round(brand_recommended_selected_count::numeric / total_selected_in_scope, 4) end
    ) from recommendation_metrics),
    'selection_habits', (select jsonb_build_object(
      'recommended_completion_rate', recommended_completion_rate,
      'top_three_traits', (select value from top_three_traits),
      'average_preference_strength', (select round(avg(preference_strength)::numeric, 1) from selected_items),
      'note', '达成率只在任务配置了建议选款数时计算；提交是否及时仅在任务设置了截止时间时计算。'
    ) from overview_metrics),
    'experience_cards', coalesce((select jsonb_agg(jsonb_build_object(
      'title', case dimension when 'category' then '品类选择倾向' when 'price_band' then '价格带选择倾向' else '风格线选择倾向' end,
      'dimension', dimension,
      'label', label,
      'data_time_range_start', (select min(created_at) from task_assignments),
      'data_time_range_end', (select max(submitted_at) from submitted_tasks),
      'support_task_count', (select submitted_task_count from overview_metrics),
      'available_count', available_count,
      'selected_count', selected_count,
      'selection_rate', case when available_count = 0 then null else round(selected_count::numeric / available_count, 4) end,
      'featured_count', featured_count,
      'featured_rate', case when selected_count = 0 then null else round(featured_count::numeric / selected_count, 4) end,
      'data_confidence', (select value from confidence),
      'conclusion', case (select value from confidence)
        when '稳定偏好' then '当前数据显示该达人对该方向具有较稳定的选择倾向。'
        when '初步倾向' then '当前样本中暂时表现出一定倾向，尚需更多任务验证。'
        else '当前样本中选择较多，数据不足以形成稳定结论。'
      end,
      'updated_at', now()
    ) order by (selected_count::numeric / nullif(available_count, 0)) desc nulls last, selected_count desc) from experience_seed), '[]'::jsonb),
    'remarks', jsonb_build_object(
      'categories', coalesce((select jsonb_agg(jsonb_build_object('label', label, 'count', count) order by count desc, label) from (
        select label, count(*)::integer as count
        from selected_items cross join lateral unnest(public.selection_compass_remark_labels(remark)) as label
        where btrim(coalesce(remark, '')) <> ''
        group by label
      ) as remark_categories), '[]'::jsonb),
      'raw', coalesce((select jsonb_agg(jsonb_build_object(
        'task_id', task_id, 'submission_id', submission_id, 'sku', sku, 'product_name', product_name,
        'remark', remark, 'labels', public.selection_compass_remark_labels(remark), 'submitted_at', submitted_at
      ) order by submitted_at desc, selection_order asc) from selected_items where btrim(coalesce(remark, '')) <> ''), '[]'::jsonb)
    ),
    'history', jsonb_build_object(
      'page', v_page,
      'page_size', v_page_size,
      'total_count', coalesce((select max(total_count) from task_history), 0),
      'records', coalesce((select jsonb_agg(jsonb_build_object(
        'task_id', task_id,
        'title', title,
        'description', description,
        'task_product_count', task_product_count,
        'recommended_count', recommended_count,
        'actual_selected_count', selected_count,
        'featured_count', featured_count,
        'top_three_count', top_three_count,
        'average_preference_strength', average_preference_strength,
        'due_at', due_at,
        'submitted_at', submitted_at,
        'submitted_on_time', case when submitted_at is null or due_at is null then null else submitted_at <= due_at end,
        'items', coalesce((select jsonb_agg(jsonb_build_object(
          'sku', sku, 'product_name', product_name, 'category', category, 'style', style,
          'plan_level', plan_level, 'price', price, 'image_url', image_url, 'is_featured', is_featured,
          'selection_order', selection_order, 'preference_strength', preference_strength, 'remark', remark
        ) order by selection_order asc) from selected_items where submission_id = history_row.submission_id), '[]'::jsonb)
      ) order by submitted_at desc nulls last, created_at desc) from paged_history as history_row), '[]'::jsonb)
    ),
    'historical_unscoped_distribution', jsonb_build_object(
      'note', '以下为无法还原任务商品范围的历史已选分布，不计算选择率。',
      'selection_item_count', (select count(*) from public.selection_items as item join public.submissions as submission on submission.id = item.submission_id where submission.creator_user_id = p_creator_user_id and submission.task_id is null),
      'categories', coalesce((select jsonb_agg(jsonb_build_object('label', category, 'selected_count', count) order by count desc, category) from (
        select item.category, count(*)::integer as count
        from public.selection_items as item join public.submissions as submission on submission.id = item.submission_id
        where submission.creator_user_id = p_creator_user_id and submission.task_id is null
        group by item.category
      ) as history_categories), '[]'::jsonb)
    )
  ) into v_result;

  return v_result;
end;
$$;

-- Product heat is calculated from creator-task scope and latest task submissions only.
create or replace function public.get_product_creator_heat(
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_category text default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 300);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_result jsonb;
begin
  if auth.uid() is null or not public.is_brand_admin() then
    raise exception 'brand admin required' using errcode = '42501';
  end if;

  with config as (
    select public.selection_compass_thresholds() as value
  ), latest_task_submissions as (
    select distinct on (submission.creator_user_id, submission.task_id)
      submission.id, submission.creator_user_id, submission.task_id, submission.submitted_at
    from public.submissions as submission
    where submission.creator_user_id is not null and submission.task_id is not null
    order by submission.creator_user_id, submission.task_id, submission.submitted_at desc, submission.id desc
  ), assignment_scope as (
    select
      assignment.creator_user_id,
      task.id as task_id,
      task_product.sku,
      product.product_name,
      product.category,
      coalesce(nullif(override.style, ''), nullif(product.style, ''), '未标注') as style,
      coalesce(nullif(override.plan_level, ''), nullif(product.plan_level, ''), '未标注') as plan_level,
      coalesce(override.price, product.price) as price,
      coalesce(override.creator_sort_priority, product.creator_sort_priority) is not null as is_brand_recommended,
      latest.id as submission_id,
      latest.submitted_at
    from public.selection_task_assignments as assignment
    join public.selection_tasks as task on task.id = assignment.task_id
    join public.selection_task_products as task_product on task_product.task_id = task.id
    join public.product_catalog as product on product.sku = task_product.sku
    left join public.product_overrides as override on override.sku = product.sku
    left join latest_task_submissions as latest
      on latest.creator_user_id = assignment.creator_user_id and latest.task_id = task.id
    where (p_date_from is null or task.created_at >= p_date_from)
      and (p_date_to is null or task.created_at < p_date_to + interval '1 day')
      and (p_category is null or p_category = '' or product.category = p_category)
  ), selection_scope as (
    select
      scope.*,
      item.is_featured,
      item.selection_order,
      item.remark
    from assignment_scope as scope
    left join public.selection_items as item
      on item.submission_id = scope.submission_id
     and item.sku = scope.sku
  ), product_metrics as (
    select
      sku,
      max(product_name) as product_name,
      max(category) as category,
      max(style) as style,
      max(plan_level) as plan_level,
      max(price) as price,
      bool_or(is_brand_recommended) as is_brand_recommended,
      count(distinct creator_user_id)::integer as assigned_creator_count,
      count(distinct creator_user_id) filter (where selection_order is not null)::integer as selected_creator_count,
      count(distinct creator_user_id) filter (where is_featured)::integer as featured_creator_count,
      count(*) filter (where selection_order <= 3)::integer as top_three_count,
      round(avg(selection_order)::numeric, 2) as average_selection_order
    from selection_scope
    group by sku
  ), product_remarks as (
    select
      sku,
      coalesce(jsonb_agg(jsonb_build_object(
        'creator_name', profile.creator_name,
        'task_id', scope.task_id,
        'remark', scope.remark,
        'labels', public.selection_compass_remark_labels(scope.remark),
        'submitted_at', scope.submitted_at
      ) order by scope.submitted_at desc) filter (where btrim(coalesce(scope.remark, '')) <> ''), '[]'::jsonb) as raw_remarks
    from selection_scope as scope
    join public.creator_profiles as profile on profile.user_id = scope.creator_user_id
    group by sku
  ), product_people as (
    select
      sku,
      coalesce(jsonb_agg(distinct profile.creator_name) filter (where selection_order is not null), '[]'::jsonb) as selected_creator_names,
      coalesce(jsonb_agg(distinct profile.creator_name) filter (where selection_order is null), '[]'::jsonb) as not_selected_creator_names
    from selection_scope as scope
    join public.creator_profiles as profile on profile.user_id = scope.creator_user_id
    group by sku
  ), tagged as (
    select
      metrics.*,
      case when assigned_creator_count = 0 then 0 else round(selected_creator_count::numeric / assigned_creator_count, 4) end as selection_rate,
      case when selected_creator_count = 0 then 0 else round(featured_creator_count::numeric / selected_creator_count, 4) end as featured_rate,
      to_jsonb(array_remove(array[
        case when assigned_creator_count >= ((config.value ->> 'high_heat_min_assigned_creators')::integer)
          and selected_creator_count::numeric / nullif(assigned_creator_count, 0) >= ((config.value ->> 'high_heat_min_selection_rate')::numeric)
          and featured_creator_count::numeric / nullif(selected_creator_count, 0) >= ((config.value ->> 'high_heat_min_featured_rate')::numeric)
          then jsonb_build_object('tag', '高热度重点款', 'reason', '分配样本、选择率与重点款率均达到阈值') end,
        case when selected_creator_count::numeric / nullif(assigned_creator_count, 0) >= ((config.value ->> 'broad_selection_min_rate')::numeric)
          and (selected_creator_count = 0 or featured_creator_count::numeric / nullif(selected_creator_count, 0) < ((config.value ->> 'high_heat_min_featured_rate')::numeric))
          then jsonb_build_object('tag', '普遍入选款', 'reason', '达人选择率较高，重点款率未达到高热度阈值') end,
        case when selected_creator_count::numeric / nullif(assigned_creator_count, 0) < ((config.value ->> 'niche_max_selection_rate')::numeric)
          and (featured_creator_count > 0 or top_three_count >= ((config.value ->> 'niche_min_top3_count')::integer))
          then jsonb_build_object('tag', '小众偏好款', 'reason', '整体选择率不高，但存在重点款或前三顺位偏好') end,
        case when is_brand_recommended
          and assigned_creator_count >= ((config.value ->> 'brand_bias_min_assigned_creators')::integer)
          and selected_creator_count::numeric / nullif(assigned_creator_count, 0) <= ((config.value ->> 'brand_bias_max_selection_rate')::numeric)
          then jsonb_build_object('tag', '品牌推荐偏差款', 'reason', '当前品牌前排推荐，但达人选择率偏低') end,
        case when not is_brand_recommended
          and selected_creator_count >= ((config.value ->> 'potential_min_selected_creators')::integer)
          and featured_creator_count::numeric / nullif(selected_creator_count, 0) >= ((config.value ->> 'potential_min_featured_rate')::numeric)
          then jsonb_build_object('tag', '潜力发现款', 'reason', '未进入品牌前排，但多位达人选择或重点选择') end
      ]::jsonb[], null)) as labels
    from product_metrics as metrics
    cross join config
  ), numbered as (
    select *, count(*) over () as total_count
    from tagged
  )
  select jsonb_build_object(
    'generated_at', now(),
    'thresholds', (select value from config),
    'total_count', coalesce((select max(total_count) from numbered), 0),
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'sku', row.sku,
      'product_name', row.product_name,
      'category', row.category,
      'style', row.style,
      'plan_level', row.plan_level,
      'price', row.price,
      'is_brand_recommended', row.is_brand_recommended,
      'assigned_creator_count', row.assigned_creator_count,
      'selected_creator_count', row.selected_creator_count,
      'selection_rate', row.selection_rate,
      'featured_creator_count', row.featured_creator_count,
      'featured_rate', row.featured_rate,
      'top_three_count', row.top_three_count,
      'average_selection_order', row.average_selection_order,
      'labels', row.labels,
      'selected_creator_names', people.selected_creator_names,
      'not_selected_creator_names', people.not_selected_creator_names,
      'raw_remarks', remarks.raw_remarks
    ) order by row.selection_rate desc, row.featured_rate desc, row.selected_creator_count desc, row.sku)
    from (select * from numbered order by selection_rate desc, featured_rate desc, selected_creator_count desc, sku limit v_limit offset v_offset) as row
    left join product_people as people on people.sku = row.sku
    left join product_remarks as remarks on remarks.sku = row.sku), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.selection_compass_thresholds() from public;
revoke all on function public.selection_compass_price_band(numeric) from public;
revoke all on function public.selection_compass_stock_band(numeric) from public;
revoke all on function public.selection_compass_preference_strength(boolean, integer) from public;
revoke all on function public.selection_compass_remark_labels(text) from public;
revoke all on function public.get_selection_compass_overview(text, uuid, timestamptz, timestamptz, text, text) from public;
revoke all on function public.get_creator_selection_compass(uuid, uuid, timestamptz, timestamptz, integer, integer) from public;
revoke all on function public.get_product_creator_heat(timestamptz, timestamptz, text, integer, integer) from public;

grant execute on function public.get_selection_compass_overview(text, uuid, timestamptz, timestamptz, text, text) to authenticated;
grant execute on function public.get_creator_selection_compass(uuid, uuid, timestamptz, timestamptz, integer, integer) to authenticated;
grant execute on function public.get_product_creator_heat(timestamptz, timestamptz, text, integer, integer) to authenticated;

commit;
