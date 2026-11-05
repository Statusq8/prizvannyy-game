#!/usr/bin/env python3
"""Нарезка листов оформления (docs/ui/ART_SHEETS.md) → assets/ui/<имя>.webp.
Запуск: python3 tools/iconsheet.py <лист.png> <номер листа>   (листы на зелёном фоне; фоны и баннеры не режутся)
Делит лист по сетке листа, убирает зелёный, обрезает пустые края.
"""
import sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from animsheet import key

SHEETS = {
  1: ((4, 3), 'title_plate back_btn tab tab_on card_wide card_hero cell cell_rare btn_red btn_gold chip close'),
  2: ((4, 3), 'sys_window popup toggle_off toggle_on bar_frame bar_purple bar_gold cur_plate plus badge check check_on'),
  3: ((4, 3), 'ic_up ic_art ic_bag ic_pets ic_portal ic_heroes ic_diary ic_souls ic_tree ic_altar ic_runes ic_bones'),
  4: ((4, 3), 'ic_quests ic_mail ic_login ic_season ic_events ic_shop ic_profile ic_settings ic_photo ic_backup ic_map ic_pve'),
  5: ((4, 3), 'cur_gold cur_ticket cur_soul cur_essence cur_shard cur_dust cur_lantern cur_heart cur_xp star crown lock'),
  6: ((5, 2), 'art_blade art_eye art_fang art_grail art_banner art_gauntlet art_feather art_sand art_crown art_gate'),
  7: ((4, 3), 'rune_power rune_squad rune_strike rune_hunt rune_wealth rune_stone bone_head bone_chest bone_armR bone_armL bone_legR bone_legL'),
  8: ((4, 3), 'pot_gold pot_dmg pot_shard dun_gold dun_shard dun_rune ev_gold ev_rare ev_boss ev_blood ab_flurry ab_hunt'),
  9: ((5, 2), 'frame_1 frame_2 frame_3 frame_4 frame_5 frame_6 frame_7 frame_8 frame_9 frame_10'),
  10: ((4, 3), 'rar_E rar_D rar_C rar_B rar_A rar_S rar_SS rar_SSS rar_GOD star_1 star_2 star_3'),
  11: ((2, 2), 'gate card_back card_front vortex'),
  12: ((3, 2), 'room room_cur room_lock zone_plate shadow_btn map_markers'),
  13: ((3, 2), 'skeleton bone_slot gem_socket stat_panel ms_badge bond'),
  18: ((4, 2), 'quest_head login_cell stamp chest chest_open letter title_ribbon plaque'),
}

def main():
    src, n = sys.argv[1], int(sys.argv[2])
    (gx, gy), names = SHEETS[n]; names = names.split()
    im = np.array(Image.open(src).convert('RGBA')); h, w = im.shape[:2]; cw, ch = w / gx, h / gy
    os.makedirs('assets/ui', exist_ok=True)
    for i, name in enumerate(names):
        r, c = divmod(i, gx)
        cell = key(im[int(r * ch) + 3:int((r + 1) * ch) - 3, int(c * cw) + 3:int((c + 1) * cw) - 3].copy())
        img = Image.fromarray(cell); bb = img.getbbox()
        if not bb: print('пусто:', name); continue
        img = img.crop(bb); img.thumbnail((512, 512), Image.LANCZOS)
        img.save('assets/ui/%s.webp' % name, 'WEBP', quality=90)
        print(name, img.size)

if __name__ == '__main__':
    main()
