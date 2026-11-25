# CUI component map (~210 components, from `include/cui/cui.h`)

C99 immediate mode. `ui` is the `cui_ctx *` from `cui_app_ui(app)` or the
`frame` callback. Options are named arguments (`.opt = value`); any omitted
option takes its default. `*_ex` variants take a filled opts struct (that is
what C++ callers use).

## Core (cui.h)

Context: `cui_create(cui_ctx_desc)` / `cui_destroy`, `cui_begin_frame` /
`cui_end_frame`, `cui_viewport_size`, `cui_dpi_scale`, `cui_time`,
`cui_delta_time`, `cui_needs_redraw`, `cui_request_redraw`.
Input injection (custom platforms/tests): `cui_input_mouse_*`,
`cui_input_scroll`, `cui_input_key`, `cui_input_text`, touch (v1.5+):
`cui_input_touch(ui, finger, down, x, y)` / `cui_input_touch_move` /
`cui_input_touch_cancel` with queries `cui_touch_count/down/pressed/released/pos`,
drag-drop via
`cui_dropped_file*`. Clipboard: `cui_set_clipboard_text` /
`cui_get_clipboard_text`. Keys: `cui_shortcut(mods, key)`,
`cui_key_pressed`, `cui_key_down`, `cui_wants_keyboard` (false while a text
field is focused). Input routing (custom event sources: a browser, a
headless test): `cui_set_input_hook(ui, hook, user)` (intercept before the
normal handler), `cui_dispatch_input(ui, event, route, user)` (deliver a `cui_input_event` —
touch arrives as `CUI_INPUT_TOUCH`/`CUI_INPUT_TOUCH_MOVE` with `.finger`;
`route` decides which widget gets it), `cui_input_repeated`
(key is an auto-repeat), `cui_key_action_down(ui, key)` (held). Cursor over
custom areas: `cui_set_cursor(ui, cui_cursor_*)`. Focus scope (modal-ish
widgets that must not leak focus outside): `cui_push_focus_scope(ui, id,
active)` / `cui_pop_focus_scope(ui)`; queries: `cui_focused_id`,
`cui_request_component_focus`, `cui_component_has_input`,
`cui_window_focused`, `cui_focus_visible`. App layer lives in `cui_app.h`: `cui_app_run`,
`cui_app_create`, `cui_app_frame`, `cui_app_ui`, `cui_app_file_dialog`,
`cui_app_open_url`, `cui_app_follow_system_theme`. Window state (v1.4+):
`cui_app_maximize(app)` (NULL = running app), `cui_app_minimize`,
`cui_app_restore`, `cui_app_window_state` → `cui_window_state`,
`cui_app_set_position`, `cui_app_placement` → `cui_window_placement`.

## Icons

- Embedded: Lucide icon font under `CUI_FONT_ICONS`, ~1000 glyphs.
- Constants: `CUI_ICON_PLUS`, `CUI_ICON_X`, `CUI_ICON_DOWNLOAD`,
  `CUI_ICON_SEARCH`, `CUI_ICON_SETTINGS`, `CUI_ICON_LIST_CHECKS`, ... (enum
  in `cui.h` — icon options like `.icon =` accept these).
- Any glyph by name: `cui_icon(ui, "feather", 16, color)` and icon options
  accept a Lucide name string.
- Other icon fonts: `cui_font_load_file` + `cui_font_set_role(ui,
  CUI_FONT_ICONS, my_font)`.
- Emoji: `cui_emoji_font_load_file/_memory/_system`, `cui_emoji(ui, "🚀", size)`,
  `cui_emoji_picker`.

## Text

`cui_text` (wraps), `cui_textf(fmt, ...)`, `cui_heading(text, level 1..4)`,
`cui_label` (medium weight), `cui_secondary`, `cui_muted`, `cui_code`
(inline), `cui_kbd` (keycap), `cui_link` (returns true when clicked).
Text effects: `cui_shimmer_text`, `cui_typewriter`, `cui_text_reveal`,
`cui_word_rotate`, `cui_number_roll`, `cui_gradient_text`, `cui_counter`,
`cui_ticker`, `cui_countdown`, `cui_dot_display` (5×7 dot font).

## Layout & containers

`cui_column` / `cui_row` / `cui_box` (`.dir = CUI_STACK | CUI_GRID`,
`.columns`, `.min_column_width`, `.wrap`, `.align`, `.justify`, `.pad*`,
`.gap`, `.bg`, `.border`, `.radius`, `.elevation`, `.scroll_x/y`, `.opacity`,
`.direction` for RTL). Sizes: `CUI_FIT` (default), `CUI_FILL`, `CUI_GROW(n)`,
`CUI_PX(240)`, `CUI_PCT(50)`; `min_/max_width`, `min_/max_height`.
`cui_spacer`, `cui_gap(n)`, `cui_separator`, `cui_card { }`,
`cui_scroll { }` (`.id`, `.fade_edges`, `.horizontal`), `cui_scroll_to`,
`cui_scroll_reveal(scroll_id, row)` (v1.5 — keep a row in view with the
least movement),
`cui_split { }` (`.vertical`, `.min_first/.min_second`),
`cui_virtual_list` for long lists, `cui_get_rect(id)` / `cui_last_rect`.

## Buttons & actions

`cui_button` (`.variant = CUI_BUTTON_PRIMARY/DANGER/GHOST`,
`.size = CUI_SIZE_SM`, `.icon`, `.tooltip`, `.disabled`),
`cui_icon_button`, `cui_segmented(id, items, n, &index)`,
`cui_chip(label, &selected)`, `cui_button_group`, `cui_copy_button`,
`cui_hold_button`, `cui_confirm_button` (click-to-confirm),
`cui_split_button`, `cui_toggle_group`, `cui_radio_cards`,
`cui_status_button`, `cui_speed_dial`, `cui_reactions`.

## Inputs

`cui_input(id, buf, cap, .label, .placeholder, .width)` → returns flags,
check `& CUI_CHANGED` / `& CUI_SUBMITTED` (Enter). `cui_textarea`,
`cui_search`, `cui_number(&value, min, max)`, `cui_select(items, n, &index)`,
`cui_multi_select`, `cui_tag_input`, `cui_otp_input`, `cui_money_input`,
`cui_inline_edit`, `cui_checkbox(label, &bool)`, `cui_switch(label, &bool)`,
`cui_radio(label, &index, option)` / `cui_radio_group`,
`cui_slider(label, &float, min, max, .show_value)`, `cui_range_slider`,
`cui_step_slider`, `cui_ruler_slider`, `cui_histogram_slider`, `cui_knob`,
`cui_fader`, `cui_scrub`, `cui_rating`, `cui_shortcut_recorder`,
`cui_password_strength`.

## Pickers & dates

`cui_date_picker`, `cui_calendar`, `cui_range_calendar`,
`cui_date_range_picker`, `cui_time_picker`, `cui_wheel_picker`,
`cui_time_dial`, `cui_color_picker`, `cui_emoji_picker`,
`cui_schedule_picker` (cron string, with `cui_cron_next` /
`cui_cron_describe`), `cui_aspect_picker`.

## Overlays & feedback

`cui_dialog(title, &open) { ... cui_dialog_footer { } }` — put dialogs at
the end of frame; the closing x/Esc/outside-click writes `false` into your
bool. `cui_sheet(title, &open, .side = CUI_SIDE_LEFT, .size)` (drawer),
`cui_popover(id)`, `cui_menu(label)`, `cui_context_menu(id)`,
`cui_menu_item`, `cui_menu_bar` + `cui_menu_bar_menu`,
`cui_tooltip(text)`, `cui_toast(title)` (+ handles: `cui_toast_action_clicked`,
`cui_toast_dismiss`), `cui_alert`, `cui_banner(text, &open)`,
`cui_hover_card`, `cui_confirm_popover`, `cui_tour`, `cui_command_palette`,
`cui_theme_switcher` / `cui_theme_toggle`.

## Status & structure

`cui_progress(value)`, `cui_progress_ring`, `cui_spinner(size)`,
`cui_skeleton`, `cui_badge(text, .tone = CUI_TONE_ACCENT)`,
`cui_status_tag`, `cui_avatar(name)`, `cui_avatar_group`,
`cui_empty_state(title, .icon, .description)`,
`cui_metric(label, value, .delta)`, `cui_meter(label, used, total, unit)`,
`cui_accordion(title, &open)`, `cui_tree(label, &open)` (+`cui_tree_clicked`),
`cui_list_item`, `cui_timeline_item`, `cui_reorder`, `cui_expandable_text`,
`cui_expandable_card`, `cui_toc` + `cui_toc_anchor`.

## Data views

`cui_table(columns) { cui_table_row(selected) { cui_table_cell_text(...) } }`,
`cui_data_grid` (editable cells: `cui_data_grid_cell_edit`),
`cui_tree_table` (sortable via `cui_tree_sort`, move/reorder rows via
`cui_tree_move`, right-click menu via `cui_tree_table_menu_begin(ui, id,
&node)` / `cui_tree_table_menu_end`, v1.5), `cui_kanban` (columns/cards
begin-end pairs; `cui_kanban_end` returns the move), `cui_filter_bar`,
`cui_path_bar`, `cui_file_browser`, `cui_file_picker`,
`cui_inspector` + `cui_prop_float/int/text/bool/enum/color/vec`,
`cui_keymap`, `cui_feature_flags`.

## Charts & visualization

`cui_line_chart`, `cui_bar_chart`, `cui_donut_chart`, `cui_sparkline`,
`cui_gauge`, `cui_radial_gauge`, `cui_scatter_chart`, `cui_candlestick`,
`cui_heatmap`, `cui_calendar_heatmap`, `cui_treemap`, `cui_radar_chart`,
`cui_funnel`, `cui_sankey`, `cui_waffle`, `cui_split_bar`, `cui_bar_list`,
`cui_activity_rings`, `cui_event_track`, `cui_dot_chart`, `cui_commit_graph`,
`cui_waterfall` (network), `cui_time_histogram`, `cui_uptime`,
`cui_coverage`. Series data: `cui_series`. Charts use
`CUI_COLOR_SERIES(0..5)`.

## Media

`cui_image_create/load/destroy`, `cui_image_update` (sub-rectangle RGBA
update without reloading), `cui_image(tex)`, `cui_image_viewer`
(pan/zoom), `cui_cropper`, `cui_carousel`, `cui_image_compare`
(before/after slider), `cui_card_stack`, `cui_now_playing`, `cui_waveform`,
`cui_voice_orb`, `cui_voice_wave`, `cui_voice_note`, `cui_voice_session`,
`cui_avatar_upload`, `cui_dropzone`, `cui_signature_pad`.

## Code & developer tools

`cui_code_block` (`.highlight`), `cui_json_view`, `cui_markdown` (returns
event result; checkbox tasks via `cui_markdown_apply_task`),
`cui_code_editor` (+ `cui_code_editor_goto/select/find`),
`cui_diff_view` (+ `cui_diff_compute`), `cui_hex_view`, `cui_log_init` +
`cui_log_view`, `cui_terminal_init/write` + `cui_terminal`,
`cui_flame_graph`, `cui_curve_editor`, `cui_gradient_editor`,
`cui_problems`, `cui_test_explorer`, `cui_stack_trace`,
`cui_request_bar` (+ `cui_response_status`, `cui_url_params`),
`cui_api_explorer`, `cui_regex_tester` (+ `cui_regex_search`), `cui_blame`.

## AI / chat UI

`cui_chat_message`, `cui_chat_divider`, `cui_typing_indicator`,
`cui_comment`, `cui_presence`, `cui_live_cursors`, `cui_presence_pill`,
`cui_reasoning`, `cui_tool_call`, `cui_agent_plan`, `cui_agent_status`,
`cui_source_list`, `cui_citation`, `cui_context_meter`,
`cui_response_actions`, `cui_prompt_suggestions`, `cui_model_picker`,
`cui_chat_composer`.

## Planning

`cui_checklist`, `cui_gantt`, `cui_week_calendar`, `cui_month_calendar`,
`cui_kv_editor`, `cui_timeline_editor`, `cui_pipeline`, `cui_query_builder`
(+ `cui_query_text` / `cui_query_match`), `cui_problems`.

## App chrome / IDE shell

`cui_nav_item` / `cui_nav_section`, `cui_breadcrumb`, `cui_pagination`,
`cui_tabs`, `cui_tab_bar`, `cui_toolbar` (+ buttons/radio/groups),
`cui_status_bar` (+ items, progress), `cui_doc_tabs`, `cui_dockspace` +
`cui_dock_panel` + `cui_dock_save/load`, `cui_dock`,
`cui_control_tile`, `cui_stepper`, `cui_theme_switcher`.

## Custom drawing (docs/custom-components.md)

Inside any container: `cui_draw_rect(_border/_gradient)`, `cui_draw_shadow`,
`cui_draw_line`, `cui_draw_polyline`, `cui_draw_polygon`, `cui_draw_circle`,
`cui_draw_arc`, `cui_draw_text`, `cui_draw_icon`, `cui_draw_image`,
`cui_push_clip`/`cui_pop_clip`. Stateful custom widgets: `cui_canvas(id, w,
h, paint_fn, user)` + `cui_state(id, size)` (persists between frames) +
`cui_canvas_ex(id, w, h, paint_fn, user, user_size, &opts)` (canvas with
`cui_canvas_opts`) + `cui_animate(id, target)` / `cui_animate_spring`.
Frame arena for paint callbacks: `cui_frame_alloc(ui, n)` /
`cui_frame_strdup(ui, s)` (valid until `cui_end_frame`). Wheel input for custom
regions: `cui_wheel_region(ui, id, rect)` + `cui_wheel_take(ui, id, &delta)`
(opt-in, so page scroll and canvas zoom coexist). Node editor:
`cui_node_editor` + `cui_node_begin/end`, pins, `cui_node_link`, events for
created/removed links and deleted nodes.

## Files, links, misc

`cui_app_file_dialog` (CUI_FILE_OPEN/SAVE/FOLDER), `cui_app_open_url`,
`cui_link` (in-page), `cui_format_bar` (rich text), `cui_readout`,
`cui_selection_bar`, `cui_canvas_controls`, `cui_result_card`,
`cui_ratio_slider`, `cui_palette_strip`, `cui_seed_field`,
`cui_option_action`.
