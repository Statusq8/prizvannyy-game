#!/usr/bin/env python3
"""Нарезка листов оформления пользователя (docs/reference/ui_sheets/*.png) на отдельные картинки assets/ui/<имя>.webp.
Предметы находятся автоматически (пятна на зелёном фоне, близкие искры склеиваются), порядок — по рядам слева направо.
Имена — в UI_NAMES ниже (по листу). Запуск: python3 tools/uicut.py  (режет все листы из списка)."""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(__file__))
from animsheet import key

UI_NAMES = {
 '01_frames': 'title_plate card_wide tab tab_on cell cell_rare cur_plate popup back_btn close_btn plus_btn gem',
 '02_menu': 'ic_heroes ic_art ic_bag ic_pets ic_map ic_portal ic_battle ic_pve ic_power ic_loot ic_quests ic_settings',
 '03_actions': 'ac_levelup ac_portal ac_transfer ac_chest ac_lock ac_summon ac_reroll ac_trash ac_armor ac_weapon ac_stars ac_gear',
 '04_bars_badges': 'bar_green bar_blue bar_purple bar_gold ring_laurel ring_flame ring_time burst_up bd_star bd_shield bd_swords bd_chest',
 '05_card_frames': 'fr_sq_1 fr_sq_2 fr_sq_3 fr_sq_4 fr_card_1 fr_card_2 fr_card_3 fr_card_4 fr_plate_1 fr_plate_2 fr_plate_3 fr_plate_4',
 '06_rarity': 'rar_E rar_D rar_C rar_B rar_A rar_S rar_SS rar_GOD rarf_E rarf_D rarf_C rarf_B rarf_A rarf_S rarf_SS rarf_GOD',
 '07_pets': 'pet_paw pet_summon pet_up pet_evolve pet_claw pet_guard pet_heal pet_egg pet_food pet_collar pet_gold pet_crystal',
 '08_items': 'chest_purple chest_red chest_blue chest_gold scroll_quest scroll_hero key_gold key_blue potion_red potion_blue hero_shard crystal',
 '09_summon': 'gate_purple gate_gold circle_purple circle_gold ticket_purple ticket_gold cry_purple cry_gold orb_purple orb_gold star_purple star_rainbow',
 '10_stats': 'st_atk st_str st_hp st_def st_soul st_rank st_stars st_transfer st_book st_crystal st_rebirth st_prestige',
 '11_modes': 'md_tower md_boss md_dungeon md_altar md_endless md_trial md_secret md_echo md_dragon md_treasury md_mine md_ritual',
 '12_achievements': 'ach_trophy ach_medal ach_crown ach_shield ach_chest ach_scroll ach_rosette ach_crystal ach_target ach_swords ach_peak ach_time',
 '13_tools': 'tl_search tl_filter tl_sort tl_layers tl_rarity tl_faction tl_fav tl_lock tl_check tl_grid tl_list tl_refresh',
 '14_shop': 'sh_cart sh_coins sh_bag sh_sale sh_gift sh_chest sh_bundle sh_giftc sh_vip sh_month sh_news sh_exchange',
 '15_quests': 'q_list q_login q_trophy q_chest q_gift q_banner q_done q_time q_alert q_star q_reset q_event',
 '16_forge': 'fg_rings fg_anvil fg_up fg_lock fg_stars fg_swap fg_add fg_stack fg_shrine fg_elements fg_chest fg_crown',
 '17_settings': 'set_gear set_sound set_bell set_help set_info set_cloud set_save set_refresh set_ok set_cancel set_back set_power',
 '18_profile': 'pr_hero pr_person pr_rank pr_time pr_trophy pr_quests pr_stats pr_flags pr_medal pr_clan pr_calendar pr_crystals',
}
IRREG = {'01_frames', '04_bars_badges'}
ROWS = {'05_card_frames': [0, 340, 855, 1086]}
GRID = {'06_rarity': (4, 4)}
MAXS = {'card_wide': 512, 'popup': 512, 'title_plate': 512, 'cur_plate': 384, 'tab': 384, 'tab_on': 384, 'gate_purple': 384, 'gate_gold': 384,
        'fr_card_1': 320, 'fr_card_2': 320, 'fr_card_3': 320, 'fr_card_4': 320, 'fr_plate_1': 384, 'fr_plate_2': 384, 'fr_plate_3': 384, 'fr_plate_4': 384,
        'bar_green': 384, 'bar_blue': 384, 'bar_purple': 384, 'bar_gold': 384}
DEF = 144

def cut(sheet, names):
    arr = np.array(Image.open('docs/reference/ui_sheets/%s.png' % sheet).convert('RGBA'))
    rgb = arr[..., :3].astype(int); strict = ~((rgb[..., 1] > rgb[..., 0] * 1.05) & (rgb[..., 1] > rgb[..., 2] * 1.05))
    arr = key(arr)
    if sheet not in IRREG:          # обычная сетка: делим поровну
        gx, gy = GRID.get(sheet, (4, 3)); h, w = arr.shape[:2]; full = Image.fromarray(arr)
        for i, nm in enumerate(names):
            r, c = divmod(i, gx)
            ys = ROWS.get(sheet) or [int(k * h / gy) for k in range(gy + 1)]
            im = full.crop((int(c * w / gx) + 2, ys[r] + 2, int((c + 1) * w / gx) - 2, ys[r + 1] - 2))
            al = np.array(im)[..., 3]; al[al < 70] = 0; im.putalpha(Image.fromarray(al)); bb = im.getbbox(); im = im.crop(bb)
            mx = MAXS.get(nm, DEF); im.thumbnail((mx, mx), Image.LANCZOS); im.save('assets/ui/%s.webp' % nm, 'WEBP', quality=82)
        return len(names)
    a = strict
    m = ndimage.binary_dilation(a[::2, ::2], iterations=3)
    lab, n = ndimage.label(m)
    objs = ndimage.find_objects(lab)
    boxes = []
    for i, sl in enumerate(objs):
        y0, y1, x0, x1 = sl[0].start * 2, sl[0].stop * 2, sl[1].start * 2, sl[1].stop * 2
        area = (lab[sl] == i + 1).sum()
        if area * 4 < 2500: continue
        boxes.append([x0, y0, x1, y1, area])
    boxes.sort(key=lambda b: -b[4]); boxes = boxes[:len(names)]
    boxes.sort(key=lambda b: (b[1] + b[3]) / 2)
    rows, cur = [], []
    for b in boxes:
        if cur and (b[1] + b[3]) / 2 - np.mean([(c[1] + c[3]) / 2 for c in cur]) > 120: rows.append(cur); cur = []
        cur.append(b)
    rows.append(cur)
    flat = [b for r in rows for b in sorted(r, key=lambda b: b[0])]
    if len(flat) != len(names): print('!!', sheet, 'найдено', len(flat), 'из', len(names))
    full = Image.fromarray(arr)
    for nm, (x0, y0, x1, y1, _) in zip(names, flat):
        im = full.crop((x0, y0, x1, y1)); bb = im.getbbox(); im = im.crop(bb)
        mx = MAXS.get(nm, DEF); im.thumbnail((mx, mx), Image.LANCZOS)
        im.save('assets/ui/%s.webp' % nm, 'WEBP', quality=82)
    return len(flat)

os.makedirs('assets/ui', exist_ok=True)
for sh, nm in UI_NAMES.items(): print(sh, cut(sh, nm.split()))
