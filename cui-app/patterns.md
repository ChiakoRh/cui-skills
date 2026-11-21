# UI patterns with CUI — copy these shapes

Every pattern here is tested shape from the repo docs (`docs/tutorial.md`,
`docs/recipes.md`, `docs/layout.md`, `docs/apps.md`) and the example apps in
`examples/` (todo, mail, notes, music, dashboard — read them, they are the
best reference).

## App skeleton (always start like this)

```c
typedef struct { /* everything the screen shows */ } app_state;

static void frame(cui_ctx *ui, void *user) {
    app_state *a = user;
    /* describe the whole screen, top to bottom */
}

int main(void) {
    static app_state a;
    /* load(&a); */
    return cui_app_run(&(cui_app_desc){ .title = "App", .width = 900, .height = 600 }, frame, &a);
}
```

- `frame` runs only when something needs drawing. Your struct is the truth;
  nothing else needs syncing.
- Collect actions in the loop (`remove = i;`), apply them **after** the loop.
- Set one `changed` flag and save once at the end of the frame.

## Responsive window wrapper

Center a content column that grows on phones and stops on monitors:

```c
cui_column(ui, .width = CUI_FILL, .height = CUI_FILL, .align = CUI_ALIGN_CENTER, .bg = CUI_COLOR_BACKGROUND) {
    cui_column(ui, .width = CUI_FILL, .max_width = 560, .height = CUI_FILL, .pad = 24, .gap = 16) { ... }
}
```

## Sidebar + content (apps.md)

```c
bool narrow = cui_viewport_size(ui).x < 760;
cui_row(ui, .width = CUI_FILL, .height = CUI_FILL, .align = CUI_ALIGN_STRETCH) {
    if (!narrow) { sidebar(ui, s); cui_separator(ui); }
    content(ui, s, narrow);
}
cui_sheet(ui, "Menu", &s->drawer, .side = CUI_SIDE_LEFT, .size = 280) { nav(ui, s); }   /* drawer when narrow */
```

Sidebar nav uses `cui_nav_section("Library")` + `cui_nav_item("Inbox", .icon = CUI_ICON_INBOX, .selected = ...)`.

## List + detail pane

```c
cui_row(ui, .width = CUI_FILL, .height = CUI_FILL, .align = CUI_ALIGN_STRETCH) {
    cui_scroll(ui, .id = "list", .width = CUI_PX(280), .height = CUI_FILL) {
        for (int i = 0; i < n; i++) {
            cui_push_id_int(ui, i);
            if (cui_list_item(ui, title[i], .selected = i == *sel, .description = sub[i])) *sel = i;
            cui_pop_id(ui);
        }
    }
    cui_separator(ui);
    detail(ui, *sel);
}
```

## Form with validation (docs/recipes.md)

Validate in the frame — it is just C:

```c
bool email_ok = strchr(a->email, '@') && a->email[0] != '@';
cui_input(ui, "email", a->email, sizeof a->email, .label = "Email", .width = CUI_FILL);
if (a->email[0] && !email_ok) cui_muted(ui, "Enter a valid email address.");
if (cui_button(ui, "Create account", .variant = CUI_BUTTON_PRIMARY, .disabled = !email_ok || !a->name[0])) create(a);
```

## Settings page

`cui_switch(ui, "Dark mode", &dark)`, `cui_select`, `cui_slider`, grouped in
`cui_card(ui, .gap = 12)` blocks with `cui_label` headers. Persist the
struct to a file the same way as the list above. For remembering across
runs with no code, see `docs/recipes.md#settings-that-are-remembered`
(`cui_state`-backed storage in `docs/custom-components.md#state`).

## Sorted table (docs/recipes.md)

```c
static int sort_col; static bool sort_desc;
cui_table_begin(ui, "users", cols, 4, .width = CUI_FILL) {
    for (int i = 0; i < n; i++) {
        if (cui_table_row(ui, i == selected)) selected = i;
        cui_table_cell_text(name[i]);
        cui_table_cell_textf("%d", age[i]);
    }
}
cui_table_end(ui);
/* header clicks come through the column result; re-sort your array, do not reorder widgets */
```

## Long work on another thread (docs/recipes.md)

Do the work in a worker thread, post progress into your `app_state` under a
mutex or an atomic, show `cui_progress` / `cui_spinner` / `cui_skeleton`
while it runs, `cui_toast(ui, "Done")` when finished. The frame function
must not block.

## Empty / loading states

```c
if (!count) cui_empty_state(ui, "No tasks yet", .icon = CUI_ICON_LIST_CHECKS, .description = "Type one above and press Enter.");
```

## Working with dates & i18n

`cui_date`, `cui_date_today()`, `cui_date_from_days/cui_date_to_days` for
storage. Persian/RTL: `.direction = CUI_DIRECTION_RTL` (or `AUTO`) on the
context or any container, and build CUI with `CUI_TEXT_SHAPING` for proper
Arabic-script shaping; load a Persian font as a fallback
(`cui_font_add_fallback`). Layout mirror matrix in `docs/layout.md`.

## Testing & screenshots without clicking

```sh
CUI_SCREENSHOT=out.png CUI_SCREENSHOT_FRAMES=60 .\build\my_app.exe
```

Unit-test without a window: create a context with the software renderer,
feed `cui_input_*`, render to memory — pattern in `tests/test_main.c`.
