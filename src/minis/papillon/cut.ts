// Written by cut.py (src/minis/papillon/cut.py): do not edit by hand.
import { Piece } from '../kit';

/** The photos that take the place of the paper pieces: how big each is drawn, and where it is held. */
export const CUT: Piece[] = [
  { key: 'papillon_sign', file: 'sign.png', w: 310.0, border: 2.4, anchor: [0.5000, 0.0000] },
  { key: 'papillon_table', file: 'table.png', w: 720.0, border: 2.4, anchor: [0.5000, 0.0240] },
  { key: 'papillon_table_long', file: 'table-long.png', w: 1200.0, border: 2.4, anchor: [0.5000, 0.0206] },
  { key: 'papillon_plate', file: 'plate.png', w: 92.0, border: 1.6, anchor: [0.5000, 0.5800] },
  { key: 'papillon_glass', file: 'glass.png', h: 68.0, border: 1.4, anchor: [0.5068, 0.9700] },
  { key: 'papillon_glass_red', file: 'glass-red.png', h: 68.0, border: 1.4, anchor: [0.5164, 0.9700] },
  { key: 'papillon_candle', file: 'candle.png', h: 104.0, border: 1.5, anchor: [0.4841, 0.9700] },
  { key: 'papillon_rose', file: 'rose.png', h: 96.0, border: 1.5, anchor: [0.4473, 0.9700] },
  { key: 'papillon_cloche', file: 'cloche.png', w: 96.0, border: 1.8, anchor: [0.5000, 0.9400] },
  { key: 'papillon_tray', file: 'tray.png', w: 120.0, border: 1.6, anchor: [0.5000, 0.5800] },
  { key: 'papillon_amuse', file: 'amuse.png', w: 108.0, border: 1.6, anchor: [0.5000, 0.6200] },
  { key: 'papillon_menu', file: 'menu.png', w: 174.5, border: 2, anchor: [0.5000, 0.4567] },
  { key: 'papillon_chair', file: 'chair.png', w: 184.0, border: 2.2, anchor: [0.5000, 0.0000] },
  { key: 'papillon_waiter', file: 'waiter.png', h: 312.0, border: 2.4, anchor: [0.5128, 0.9957] },
  { key: 'papillon_waiter_serve', file: 'waiter-serve.png', h: 312.0, border: 2.4, anchor: [0.3769, 0.9943] },
  { key: 'papillon_sit_bill', file: 'sit-bill.png', w: 187.4, border: 2.4, anchor: [0.5130, 0.0398] },
  { key: 'papillon_sit_stephanie', file: 'sit-stephanie.png', w: 160.6, border: 2.4, anchor: [0.4999, 0.0243] },
  { key: 'papillon_sit_christian', file: 'sit-christian.png', w: 188.8, border: 2.4, anchor: [0.4900, 0.0379] },
  { key: 'papillon_sit_shane', file: 'sit-shane.png', w: 191.5, border: 2.4, anchor: [0.5073, 0.0372] },
  { key: 'papillon_sit_chad', file: 'sit-chad.png', w: 192.0, border: 2.4, anchor: [0.5016, 0.0350] },
  { key: 'papillon_sit_branson', file: 'sit-branson.png', w: 191.0, border: 2.4, anchor: [0.4989, 0.0394] },
  { key: 'papillon_dish_soup', file: 'dish-soup.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_escargots', file: 'dish-escargots.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_shrimp', file: 'dish-shrimp.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_salad', file: 'dish-salad.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_steak', file: 'dish-steak.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_salmon', file: 'dish-salmon.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_chicken', file: 'dish-chicken.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_lobster', file: 'dish-lobster.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_cake', file: 'dish-cake.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_tart', file: 'dish-tart.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_sundae', file: 'dish-sundae.png', w: 75.9, border: 1.8, anchor: [0.5000, 0.5000] },
  { key: 'papillon_dish_cheesecake', file: 'dish-cheesecake.png', w: 100.0, border: 1.8, anchor: [0.5000, 0.5000] },
];

/** The room, which is one photo: how tall it is drawn, where its top is put (it is centred on the page),
 *  and where that puts the rail of its panelling and the edge of its carpet. */
export const ROOM_FIT = { file: 'room.jpg', tall: 662.4, top: -63.5, rail: 292, carpet: 478.3 };

/** The sign: where its name is lettered on the board (in the piece, as it is drawn), and how wide it may be. */
export const SIGN_FIT = { name: [155.0, 67.5], wide: 185.6 };

/** The waiter in the photos, facing right: where his mouth and the top of his head are from the floor under
 *  him, standing and serving; and, serving, the spot on his hand that a tray sits on. */
export const WAITER_FIT = { stand: { mouth: { x: 5.8, y: -275.9 }, top: { x: 0.0, y: -309.8 } }, serve: { hand: { x: 71.4, y: -245.0 }, mouth: { x: 5.8, y: -276.3 }, top: { x: -0.9, y: -310.2 } } };
