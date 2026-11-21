/* Starter CUI app — the pattern from docs/tutorial.md.
   Build: cmake -S . -B build && cmake --build build --config Release */
#include <cui/cui.h>
#include <cui/cui_app.h>
#include <stdio.h>
#include <string.h>

#define MAX_ITEMS 200

typedef struct { char title[96]; bool done; } item;

typedef struct {
    item items[MAX_ITEMS];
    int count;
    char draft[96];
    char path[512];
} app_state;

static bool add_item(app_state *a) {
    if (!a->draft[0] || a->count >= MAX_ITEMS) return false;
    item *t = &a->items[a->count++];
    snprintf(t->title, sizeof t->title, "%s", a->draft);
    t->done = false;
    a->draft[0] = 0;
    return true;
}

static void save(const app_state *a) {
    if (!a->path[0]) return;
    FILE *f = fopen(a->path, "w");
    if (!f) return;
    for (int i = 0; i < a->count; i++) fprintf(f, "%c %s\n", a->items[i].done ? 'x' : '-', a->items[i].title);
    fclose(f);
}

static void frame(cui_ctx *ui, void *user) {
    app_state *a = user;
    bool changed = false;
    int remove = -1;

    cui_column(ui, .width = CUI_FILL, .height = CUI_FILL, .align = CUI_ALIGN_CENTER, .bg = CUI_COLOR_BACKGROUND) {
        cui_column(ui, .width = CUI_FILL, .max_width = 560, .height = CUI_FILL, .pad = 24, .gap = 16) {
            cui_row(ui, .gap = 12, .align = CUI_ALIGN_END, .width = CUI_FILL) {
                cui_heading(ui, "My app", 2);
                cui_spacer(ui);
                if (cui_icon_button(ui, CUI_ICON_MOON, .variant = CUI_BUTTON_GHOST)) cui_theme_toggle(ui);
            }
            cui_row(ui, .gap = 8, .width = CUI_FILL) {
                int typed = cui_input(ui, "new-item", a->draft, sizeof a->draft, .placeholder = "Add an item", .width = CUI_FILL);
                bool add = cui_button(ui, "Add", .variant = CUI_BUTTON_PRIMARY, .icon = CUI_ICON_PLUS, .disabled = !a->draft[0]);
                if ((typed & CUI_SUBMITTED) || add) changed |= add_item(a);
            }
            cui_scroll(ui, .id = "items", .width = CUI_FILL, .height = CUI_FILL, .gap = 2) {
                for (int i = 0; i < a->count; i++) {
                    item *t = &a->items[i];
                    cui_push_id_int(ui, i);                     /* every row gets its own id scope */
                    cui_row(ui, .gap = 8, .align = CUI_ALIGN_CENTER, .width = CUI_FILL) {
                        if (cui_checkbox(ui, t->title, &t->done)) changed = true;
                        cui_spacer(ui);
                        if (cui_icon_button(ui, CUI_ICON_X, .tooltip = "Delete", .variant = CUI_BUTTON_GHOST, .size = CUI_SIZE_SM)) remove = i;
                    }
                    cui_pop_id(ui);
                }
            }
        }
    }

    if (remove >= 0) {   /* mutate data AFTER the loop */
        memmove(&a->items[remove], &a->items[remove + 1], sizeof(item) * (size_t)(a->count - remove - 1));
        a->count--;
        changed = true;
    }
    if (changed) save(a);
}

int main(void) {
    static app_state a;
    snprintf(a.path, sizeof a.path, "data.txt");
    FILE *f = fopen(a.path, "r");
    if (f) {
        char line[128];
        while (fgets(line, sizeof line, f) && a.count < MAX_ITEMS) {
            if (line[0] != 'x' && line[0] != '-') continue;
            item *t = &a.items[a.count++];
            t->done = line[0] == 'x';
            snprintf(t->title, sizeof t->title, "%s", line + 2);
            size_t n = strlen(t->title);
            while (n && (t->title[n - 1] == '\n' || t->title[n - 1] == '\r')) t->title[--n] = 0;
        }
        fclose(f);
    }
    return cui_app_run(&(cui_app_desc){ .title = "My app", .width = 520, .height = 640 }, frame, &a);
}
