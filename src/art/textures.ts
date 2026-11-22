import Phaser from 'phaser';
import { INK, PAPER } from '../config';
import { Ctx, circle, ellipse, ink, line, makeArt, poly, rr, shade, star } from './sticker';

/** All drawn (non-photo) art. Everything is generated at boot so there are no
 *  image files to manage yet; swapping any of these for real art later only
 *  means loading a file under the same key. */

export const SKIN = ['#f7d3ab', '#eab98c', '#cf9463', '#a06a3e', '#73472a'];
const CAR_COLORS = ['#d9544d', '#3f7fbf', '#e3b23c', '#57a773', '#8e6bbf', '#e07b39', '#d9d4c7', '#4f5d75'];
const GLASS = '#a7d8ea';
const DARK_IN = '#2a3440';
const FONT = 'Bangers, Impact, "Arial Narrow Bold", sans-serif';

export interface VehicleSpec {
  key: string;
  w: number;
  h: number;
  /** Open windows a head can hang out of, relative to the bottom-centre anchor. */
  slots: { x: number; y: number }[];
}

export const VEHICLES: Record<string, VehicleSpec[]> = { sedan: [], van: [], pickup: [], wagon: [], bus: [] };
/** How many different rubbernecker heads exist (keys head0, head0_dazed, ...). */
export let HEAD_STYLES = 8;
export function setHeadStyles(n: number): void {
  HEAD_STYLES = n;
}
/** Skin tone (index into SKIN) of the phone-holding arm for each head style. */
export const ARM_TONES: number[] = [0, 1, 2, 3, 4, 0, 1, 2];

function wheel(c: Ctx, x: number, y: number, r: number, whitewall = false): void {
  circle(c, x, y, r);
  ink(c, '#2b2a2e', 2.4);
  if (whitewall) {
    circle(c, x, y, r * 0.74);
    c.fillStyle = '#f3efe4';
    c.fill();
  }
  circle(c, x, y, r * 0.5);
  ink(c, '#c9ccd2', 1.5);
  circle(c, x, y, r * 0.15);
  c.fillStyle = INK;
  c.fill();
}

/** Fill a body path, paint horizontal shading bands clipped to it, then outline. */
function body(c: Ctx, path: () => void, color: string, bands: [number, number, string][]): void {
  path();
  c.fillStyle = color;
  c.fill();
  c.save();
  c.clip();
  for (const [y, h, col] of bands) {
    c.fillStyle = col;
    c.fillRect(0, y, 600, h);
  }
  c.restore();
  path();
  c.lineWidth = 2.6;
  c.strokeStyle = INK;
  c.stroke();
}

function glass(c: Ctx, pts: number[], open = false): void {
  poly(c, pts);
  ink(c, open ? DARK_IN : GLASS, 2);
  if (!open) {
    c.save();
    poly(c, pts);
    c.clip();
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.lineWidth = 4;
    const x = pts[0] + 14, y = pts[1];
    c.beginPath();
    c.moveTo(x, y + 4);
    c.lineTo(x + 16, y - 30);
    c.stroke();
    c.restore();
  }
}

/** A shirt-coloured shoulder blob inside an open window, so the neck has an owner. */
function shoulders(c: Ctx, pts: number[], x: number, y: number, shirt: string): void {
  c.save();
  poly(c, pts);
  c.clip();
  ellipse(c, x, y, 15, 10);
  ink(c, shirt, 1.6);
  c.restore();
}

function bumper(c: Ctx, x: number, y: number, w: number): void {
  rr(c, x, y, w, 7, 3);
  ink(c, '#cfd2d8', 1.8);
}

function drawSedan(c: Ctx, color: string, shirt: string): void {
  const path = () => {
    c.beginPath();
    c.moveTo(8, 66);
    c.quadraticCurveTo(3, 48, 22, 44);
    c.lineTo(60, 39);
    c.lineTo(80, 13);
    c.quadraticCurveTo(84, 8, 94, 8);
    c.lineTo(150, 8);
    c.quadraticCurveTo(161, 8, 167, 15);
    c.lineTo(184, 39);
    c.lineTo(200, 43);
    c.quadraticCurveTo(209, 47, 207, 66);
    c.lineTo(204, 72);
    c.lineTo(10, 72);
    c.closePath();
  };
  circle(c, 52, 71, 21); c.fillStyle = INK; c.fill();
  circle(c, 162, 71, 21); c.fillStyle = INK; c.fill();
  body(c, path, color, [[58, 20, shade(color, -0.2)], [44, 3, shade(color, 0.35)]]);
  const front = [66, 39, 83, 15, 112, 15, 112, 39];
  glass(c, front, true);
  shoulders(c, front, 92, 41, shirt);
  glass(c, [118, 15, 151, 15, 160, 17, 176, 39, 118, 39]);
  line(c, [115, 41, 115, 70], INK, 1.6);
  rr(c, 122, 46, 10, 3, 1.5); c.fillStyle = INK; c.fill();
  ellipse(c, 12, 53, 4, 6); ink(c, '#fff3b0', 1.6);
  ellipse(c, 205, 53, 3, 6); ink(c, '#e2463f', 1.6);
  bumper(c, 2, 63, 15);
  bumper(c, 197, 63, 14);
  wheel(c, 52, 71, 17);
  wheel(c, 162, 71, 17);
}

function drawVan(c: Ctx, color: string, shirt: string): void {
  const path = () => {
    c.beginPath();
    c.moveTo(8, 86);
    c.lineTo(8, 54);
    c.quadraticCurveTo(10, 41, 26, 36);
    c.lineTo(46, 13);
    c.quadraticCurveTo(50, 8, 60, 8);
    c.lineTo(208, 8);
    c.quadraticCurveTo(221, 8, 221, 21);
    c.lineTo(221, 86);
    c.closePath();
  };
  circle(c, 54, 86, 21); c.fillStyle = INK; c.fill();
  circle(c, 176, 86, 21); c.fillStyle = INK; c.fill();
  body(c, path, color, [[68, 24, shade(color, -0.2)], [46, 4, shade(color, 0.35)]]);
  const front = [35, 40, 53, 15, 86, 15, 86, 40];
  glass(c, front, true);
  shoulders(c, front, 66, 42, shirt);
  rr(c, 96, 15, 48, 25, 4); ink(c, GLASS, 2);
  rr(c, 152, 15, 48, 25, 4); ink(c, GLASS, 2);
  line(c, [91, 12, 91, 84], INK, 1.6);
  line(c, [148, 44, 148, 84], INK, 1.6);
  rr(c, 96, 50, 10, 3, 1.5); c.fillStyle = INK; c.fill();
  ellipse(c, 12, 58, 4, 7); ink(c, '#fff3b0', 1.6);
  rr(c, 216, 50, 5, 14, 2); ink(c, '#e2463f', 1.6);
  bumper(c, 2, 76, 16);
  bumper(c, 212, 76, 14);
  wheel(c, 54, 86, 17);
  wheel(c, 176, 86, 17);
}

function drawPickup(c: Ctx, color: string, shirt: string): void {
  const path = () => {
    c.beginPath();
    c.moveTo(8, 68);
    c.quadraticCurveTo(3, 52, 22, 48);
    c.lineTo(62, 44);
    c.lineTo(80, 14);
    c.quadraticCurveTo(84, 9, 94, 9);
    c.lineTo(128, 9);
    c.quadraticCurveTo(137, 9, 137, 18);
    c.lineTo(137, 44);
    c.lineTo(226, 44);
    c.lineTo(228, 68);
    c.lineTo(224, 74);
    c.lineTo(10, 74);
    c.closePath();
  };
  // cargo sticking up out of the bed
  rr(c, 150, 26, 30, 22, 3); ink(c, '#c98b4b', 2);
  rr(c, 184, 20, 26, 28, 3); ink(c, '#6fa8dc', 2);
  line(c, [184, 30, 210, 30], INK, 1.4);
  circle(c, 54, 73, 21); c.fillStyle = INK; c.fill();
  circle(c, 184, 73, 21); c.fillStyle = INK; c.fill();
  body(c, path, color, [[60, 20, shade(color, -0.2)], [47, 3, shade(color, 0.35)]]);
  const win = [68, 44, 85, 16, 129, 16, 129, 44];
  glass(c, win, true);
  shoulders(c, win, 102, 46, shirt);
  line(c, [137, 46, 137, 72], INK, 1.6);
  line(c, [140, 50, 222, 50], shade(color, -0.3), 2);
  rr(c, 112, 50, 10, 3, 1.5); c.fillStyle = INK; c.fill();
  ellipse(c, 12, 56, 4, 6); ink(c, '#fff3b0', 1.6);
  rr(c, 223, 50, 4, 10, 2); ink(c, '#e2463f', 1.4);
  bumper(c, 2, 65, 15);
  bumper(c, 218, 66, 14);
  wheel(c, 54, 73, 17);
  wheel(c, 184, 73, 17);
}

/** The "good driver" car: a woody wagon with eyes forward and a dog in the back. */
function drawWagon(c: Ctx): void {
  const color = '#7fb7be';
  const path = () => {
    c.beginPath();
    c.moveTo(8, 66);
    c.quadraticCurveTo(3, 48, 22, 44);
    c.lineTo(58, 39);
    c.lineTo(78, 13);
    c.quadraticCurveTo(82, 8, 92, 8);
    c.lineTo(196, 8);
    c.quadraticCurveTo(208, 8, 210, 20);
    c.lineTo(214, 44);
    c.quadraticCurveTo(221, 48, 219, 66);
    c.lineTo(215, 72);
    c.lineTo(10, 72);
    c.closePath();
  };
  circle(c, 52, 71, 21); c.fillStyle = INK; c.fill();
  circle(c, 172, 71, 21); c.fillStyle = INK; c.fill();
  body(c, path, color, [[46, 20, '#b98450'], [66, 10, shade(color, -0.2)]]);
  line(c, [30, 46, 212, 46], '#8a5a2e', 2);
  line(c, [30, 66, 214, 66], '#8a5a2e', 2);
  for (let x = 70; x < 210; x += 34) line(c, [x, 47, x, 65], '#8a5a2e', 1.4);
  const front = [64, 39, 81, 15, 108, 15, 108, 39];
  glass(c, front);
  // attentive driver, both hands on the wheel, eyes on the road
  c.save();
  poly(c, front); c.clip();
  circle(c, 92, 27, 9); ink(c, SKIN[1], 1.6);
  circle(c, 88, 26, 1.6); c.fillStyle = INK; c.fill();
  line(c, [84, 31, 89, 31], INK, 1.2);
  rr(c, 86, 15, 16, 6, 3); ink(c, '#5b4636', 1.4);
  line(c, [78, 30, 74, 38], INK, 2.4);
  c.restore();
  rr(c, 114, 15, 40, 24, 3); ink(c, GLASS, 2);
  glass(c, [160, 15, 198, 15, 205, 39, 160, 39], true);
  line(c, [111, 41, 111, 70], INK, 1.6);
  line(c, [157, 41, 157, 70], INK, 1.6);
  ellipse(c, 12, 53, 4, 6); ink(c, '#fff3b0', 1.6);
  rr(c, 214, 48, 4, 12, 2); ink(c, '#e2463f', 1.4);
  bumper(c, 2, 63, 15);
  bumper(c, 208, 63, 14);
  wheel(c, 52, 71, 17);
  wheel(c, 172, 71, 17);
}

function drawBus(c: Ctx): void {
  const color = '#f2efe6';
  const path = () => rr(c, 6, 8, 432, 98, 16);
  for (const x of [78, 330, 374]) { circle(c, x, 104, 23); c.fillStyle = INK; c.fill(); }
  body(c, path, color, [[62, 16, '#e2463f'], [78, 6, '#f6c21c'], [84, 30, shade(color, -0.12)]]);
  glass(c, [12, 60, 12, 34, 30, 18, 52, 18, 52, 60]);
  for (const x of [86, 166, 246, 326]) {
    rr(c, x, 20, 56, 36, 5);
    ink(c, DARK_IN, 2);
  }
  rr(c, 396, 20, 30, 36, 5); ink(c, GLASS, 2);
  c.font = `22px ${FONT}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = PAPER;
  c.strokeStyle = INK;
  c.lineWidth = 3;
  c.strokeText('GAWK TOURS', 226, 71);
  c.fillText('GAWK TOURS', 226, 71);
  ellipse(c, 11, 78, 4, 7); ink(c, '#fff3b0', 1.6);
  rr(c, 433, 70, 5, 16, 2); ink(c, '#e2463f', 1.4);
  bumper(c, 1, 94, 18);
  bumper(c, 426, 94, 16);
  wheel(c, 78, 104, 19);
  wheel(c, 330, 104, 19);
  wheel(c, 374, 104, 19);
}

/** Bill's avocado-green 1959 Beetle, facing right. */
function drawBug(c: Ctx): void {
  const color = '#8a9b3c';
  const path = () => {
    c.beginPath();
    c.moveTo(16, 74);
    c.quadraticCurveTo(6, 58, 24, 44);
    c.quadraticCurveTo(50, 16, 98, 10);
    c.quadraticCurveTo(132, 6, 152, 14);
    c.lineTo(174, 40);
    c.quadraticCurveTo(210, 42, 230, 56);
    c.quadraticCurveTo(244, 64, 240, 76);
    c.lineTo(16, 76);
    c.closePath();
  };
  body(c, path, color, [[60, 20, shade(color, -0.18)], [40, 3, shade(color, 0.3)]]);
  glass(c, [70, 38, 96, 17, 116, 16, 116, 38]);
  glass(c, [121, 16, 146, 17, 163, 38, 121, 38]);
  line(c, [118, 40, 118, 72], INK, 1.6);
  line(c, [168, 42, 168, 72], INK, 1.6);
  rr(c, 124, 46, 11, 3, 1.5); ink(c, '#cfd2d8', 1.2);
  rr(c, 86, 72, 82, 6, 2); ink(c, '#3a3a40', 1.8);
  // fenders
  for (const fx of [58, 196]) {
    c.beginPath();
    c.ellipse(fx, 80, 33, 28, 0, Math.PI, 0);
    c.closePath();
    ink(c, shade(color, 0.06), 2.6);
    c.beginPath();
    c.ellipse(fx, 80, 22, 20, 0, Math.PI, 0);
    c.closePath();
    c.fillStyle = INK;
    c.fill();
  }
  circle(c, 221, 57, 7); ink(c, '#fff3b0', 2);
  ellipse(c, 22, 60, 3, 5); ink(c, '#e2463f', 1.5);
  rr(c, 3, 70, 13, 6, 3); ink(c, '#cfd2d8', 1.8);
  rr(c, 236, 72, 13, 6, 3); ink(c, '#cfd2d8', 1.8);
  wheel(c, 58, 80, 19, true);
  wheel(c, 196, 80, 19, true);
}

function drawTorso(c: Ctx): void {
  const shirt = '#f0624d';
  // neck
  rr(c, 27, 0, 18, 18, 6); ink(c, SKIN[1], 2);
  const path = () => {
    c.beginPath();
    c.moveTo(5, 72);
    c.lineTo(7, 32);
    c.quadraticCurveTo(9, 14, 28, 10);
    c.lineTo(44, 10);
    c.quadraticCurveTo(63, 14, 65, 32);
    c.lineTo(67, 72);
    c.closePath();
  };
  path();
  c.fillStyle = shirt;
  c.fill();
  // aloha print
  c.save();
  path();
  c.clip();
  const flowers: [number, number][] = [[18, 30], [50, 26], [34, 48], [12, 58], [56, 56], [36, 22]];
  for (const [fx, fy] of flowers) {
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      ellipse(c, fx + Math.cos(a) * 5, fy + Math.sin(a) * 5, 4.2, 3, a);
      c.fillStyle = '#ffb199';
      c.fill();
    }
    circle(c, fx, fy, 2); c.fillStyle = '#ffe45c'; c.fill();
  }
  c.strokeStyle = '#c2402f';
  c.lineWidth = 2;
  for (const [lx, ly] of [[26, 40], [46, 40], [22, 66], [48, 68]]) {
    c.beginPath();
    c.ellipse(lx, ly, 6, 2.4, 0.6, 0, Math.PI * 2);
    c.stroke();
  }
  c.restore();
  path();
  c.lineWidth = 2.6;
  c.strokeStyle = INK;
  c.stroke();
  // open collar
  poly(c, [28, 10, 36, 26, 44, 10]);
  ink(c, SKIN[1], 2);
  line(c, [28, 10, 22, 22, 36, 26], INK, 2);
  line(c, [44, 10, 50, 22, 36, 26], INK, 2);
}

/** Arm and bat as one piece pointing straight up; rotates about the shoulder. */
function drawArmBat(c: Ctx): void {
  // sleeve + forearm
  rr(c, 13, 118, 20, 26, 8); ink(c, '#f0624d', 2.4);
  rr(c, 16, 100, 13, 26, 6); ink(c, SKIN[1], 2.2);
  // bat
  c.beginPath();
  c.moveTo(19, 104);
  c.lineTo(18, 60);
  c.quadraticCurveTo(13, 30, 14, 14);
  c.quadraticCurveTo(22, 2, 30, 14);
  c.quadraticCurveTo(31, 30, 26, 60);
  c.lineTo(25, 104);
  c.closePath();
  ink(c, '#dba45c', 2.4);
  line(c, [22, 16, 22, 52], '#f0c88a', 2.2);
  line(c, [17, 66, 27, 66], '#8a5a2e', 2);
  rr(c, 16, 103, 12, 6, 3); ink(c, '#b97f3c', 2);
  // fists
  circle(c, 22, 88, 7.5); ink(c, SKIN[1], 2.2);
  circle(c, 22, 98, 7.5); ink(c, SKIN[1], 2.2);
  line(c, [17, 86, 27, 86], INK, 1.2);
  line(c, [17, 96, 27, 96], INK, 1.2);
}

function drawHair(c: Ctx, style: number, behind: boolean): void {
  const cx = 28, cy = 27;
  switch (style) {
    case 0: // balding, side tufts
      if (!behind) {
        ellipse(c, 9, 26, 5, 8); ink(c, '#b9b3aa', 1.8);
        ellipse(c, 47, 26, 5, 8); ink(c, '#b9b3aa', 1.8);
      }
      break;
    case 1: // short dark
      if (!behind) {
        c.beginPath(); c.arc(cx, cy - 2, 21, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(cx, 12, 8, 22); c.closePath();
        ink(c, '#3b2a20', 2);
      }
      break;
    case 2: // long hair
      if (behind) { rr(c, 5, 10, 46, 46, 16); ink(c, '#c9772b', 2); }
      else { c.beginPath(); c.arc(cx, cy - 1, 21, Math.PI, 0); c.quadraticCurveTo(cx, 16, 7, 26); c.closePath(); ink(c, '#c9772b', 2); }
      break;
    case 3: // ball cap
      if (!behind) {
        c.beginPath(); c.arc(cx, cy - 3, 21, Math.PI, 0); c.closePath(); ink(c, '#d9433b', 2);
        rr(c, 0, 20, 26, 6, 3); ink(c, '#b3322b', 2);
      }
      break;
    case 4: // top bun
      if (behind) { circle(c, cx, 6, 9); ink(c, '#2b2422', 2); }
      else { c.beginPath(); c.arc(cx, cy - 2, 21, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(cx, 18, 7, 24); c.closePath(); ink(c, '#2b2422', 2); }
      break;
    case 5: // big curls
      if (behind) {
        for (const [hx, hy, r] of [[12, 16, 11], [28, 9, 12], [44, 16, 11], [7, 30, 9], [49, 30, 9]]) { circle(c, hx, hy, r); ink(c, '#4a2f1e', 2); }
      }
      break;
    case 6: // spiky blond
      if (!behind) {
        poly(c, [8, 22, 10, 6, 17, 15, 22, 2, 28, 13, 35, 2, 39, 15, 47, 6, 48, 22, 28, 15]);
        ink(c, '#f1d35b', 2);
      }
      break;
    default: // silver perm
      if (behind) {
        for (const [hx, hy, r] of [[11, 18, 10], [22, 9, 10], [35, 9, 10], [46, 18, 10]]) { circle(c, hx, hy, r); ink(c, '#d8d6dc', 2); }
      }
  }
}

function drawHead(c: Ctx, skin: string, style: number, dazed: boolean): void {
  const cx = 28, cy = 27;
  drawHair(c, style, true);
  ellipse(c, 8, 29, 4, 6); ink(c, skin, 2);
  ellipse(c, 48, 29, 4, 6); ink(c, skin, 2);
  circle(c, cx, cy, 20); ink(c, skin, 2.4);
  if (dazed) {
    // the classic cartoon lump
    circle(c, 34, 6, 8); ink(c, '#ff8f8f', 2);
    circle(c, 31, 3, 2); c.fillStyle = '#ffd6d6'; c.fill();
  }
  drawHair(c, style, false);
  if (style === 7) { // glasses for the perm lady
    c.strokeStyle = INK; c.lineWidth = 1.6;
    circle(c, 20, 25, 8.5); c.stroke();
    circle(c, 37, 25, 8.5); c.stroke();
  }
  ellipse(c, 14, 35, 4, 2.6); c.fillStyle = 'rgba(255,120,110,0.45)'; c.fill();
  ellipse(c, 42, 35, 4, 2.6); c.fillStyle = 'rgba(255,120,110,0.45)'; c.fill();
  if (!dazed) {
    // bug eyes locked on the wreck
    circle(c, 20, 25, 7.2); ink(c, '#ffffff', 1.8);
    circle(c, 37, 25, 7.2); ink(c, '#ffffff', 1.8);
    circle(c, 17, 27, 3); c.fillStyle = INK; c.fill();
    circle(c, 34, 27, 3); c.fillStyle = INK; c.fill();
    line(c, [13, 14, 23, 12], INK, 2);
    line(c, [33, 12, 43, 14], INK, 2);
    ellipse(c, 27, 40, 5, 6); ink(c, '#5a1f1f', 1.8);
    ellipse(c, 27, 43, 3, 2.4); c.fillStyle = '#ff8f8f'; c.fill();
  } else {
    for (const ex of [20, 37]) {
      line(c, [ex - 5, 20, ex + 5, 30], INK, 2.6);
      line(c, [ex + 5, 20, ex - 5, 30], INK, 2.6);
    }
    c.beginPath();
    c.moveTo(17, 40);
    c.quadraticCurveTo(21, 36, 25, 40);
    c.quadraticCurveTo(29, 44, 33, 40);
    c.quadraticCurveTo(36, 37, 39, 40);
    c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    rr(c, 30, 40, 7, 10, 3.5); ink(c, '#ff8f8f', 1.6);
  }
}

function drawDog(c: Ctx, mad: boolean): void {
  const fur = '#e0a94e';
  ellipse(c, 50, 26, 9, 16, 0.3); ink(c, '#b97f2e', 2.2);
  circle(c, 38, 26, 18); ink(c, fur, 2.4);
  rr(c, 8, 23, 32, 19, 9); ink(c, '#f1cf8a', 2.2);
  ellipse(c, 11, 27, 5, 4); c.fillStyle = INK; c.fill();
  if (mad) {
    line(c, [28, 14, 40, 20], INK, 2.6);
    circle(c, 35, 23, 2.6); c.fillStyle = INK; c.fill();
    poly(c, [14, 37, 17, 42, 20, 37, 23, 42, 26, 37, 29, 42, 32, 37]);
    ink(c, '#ffffff', 1.4);
  } else {
    c.beginPath(); c.arc(35, 23, 4, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke();
    line(c, [14, 37, 30, 38], INK, 1.8);
    rr(c, 17, 38, 9, 13, 4.5); ink(c, '#ff8f8f', 1.8);
    line(c, [21.5, 40, 21.5, 47], '#d96a6a', 1.2);
  }
  rr(c, 30, 40, 22, 7, 3); ink(c, '#d9433b', 1.8);
  circle(c, 40, 48, 3); ink(c, '#ffd23f', 1.4);
}

function drawSign(c: Ctx, kind: number): void {
  rr(c, 35, 52, 6, 54, 2); ink(c, '#9aa0a8', 2);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  if (kind === 0) {
    poly(c, [38, 2, 73, 37, 38, 72, 3, 37]);
    ink(c, '#f6c21c', 3);
    poly(c, [38, 9, 66, 37, 38, 65, 10, 37]);
    c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
    c.fillStyle = INK;
    c.font = `15px ${FONT}`;
    c.fillText('NO', 38, 28);
    c.font = `12px ${FONT}`;
    c.fillText('GAWKING', 38, 43);
  } else {
    rr(c, 3, 8, 70, 52, 6); ink(c, '#f08a24', 3);
    rr(c, 8, 13, 60, 42, 4); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
    c.fillStyle = INK;
    c.font = `19px ${FONT}`;
    c.fillText('ROAD', 38, 26);
    c.fillText('WORK', 38, 44);
  }
}

function drawCone(c: Ctx): void {
  poly(c, [11, 1, 18, 24, 4, 24]);
  ink(c, '#f26b21', 2);
  poly(c, [8.4, 10, 13.6, 10, 15.2, 16, 6.8, 16]);
  c.fillStyle = PAPER; c.fill();
  rr(c, 1, 23, 20, 5, 2); ink(c, '#d95a18', 2);
}

function drawCloud(c: Ctx): void {
  const blobs: [number, number, number][] = [[32, 40, 22], [62, 28, 26], [96, 34, 24], [122, 44, 16], [76, 46, 20]];
  c.fillStyle = '#fffdf7';
  for (const [x, y, r] of blobs) { circle(c, x, y, r); c.fill(); }
  c.fillRect(16, 44, 116, 16);
}

/** Tile-safe random scatter: calls `fn` at every wrapped copy of a point. */
function wrapped(size: number, x: number, y: number, r: number, fn: (x: number, y: number) => void): void {
  for (const ox of [-size, 0, size]) {
    for (const oy of [-size, 0, size]) {
      if (x + ox + r < 0 || x + ox - r > size || y + oy + r < 0 || y + oy - r > size) continue;
      fn(x + ox, y + oy);
    }
  }
}

/** Per-pixel grain, applied to the whole canvas the context belongs to. */
function grain(c: Ctx, amount: number): void {
  const { width, height } = c.canvas;
  const im = c.getImageData(0, 0, width, height);
  const d = im.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  c.putImageData(im, 0, 0);
}

/** The printed-page finish as ONE see-through sheet laid over the screen: a
 *  cream wash that fades the blacks, paper blotches and fibres, fine grain,
 *  and a screen of print dots. One layer keeps it cheap on phones. */
function drawPaper(c: Ctx): void {
  const S = 256;
  c.fillStyle = 'rgba(232,206,158,0.085)';
  c.fillRect(0, 0, S, S);
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 18 + Math.random() * 52;
    const dark = Math.random() < 0.55;
    const col = dark ? '120,84,40' : '255,246,222';
    const a = dark ? 0.07 : 0.045;
    wrapped(S, x, y, r, (px, py) => {
      const g = c.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(${col},${a})`);
      g.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = g;
      c.fillRect(px - r, py - r, r * 2, r * 2);
    });
  }
  c.lineWidth = 0.5;
  for (let i = 0; i < 170; i++) {
    const x = Math.random() * S, y = Math.random() * S, a = Math.random() * Math.PI, l = 5 + Math.random() * 13;
    c.strokeStyle = Math.random() < 0.6 ? 'rgba(96,70,40,0.2)' : 'rgba(255,252,240,0.26)';
    wrapped(S, x, y, l, (px, py) => {
      c.beginPath();
      c.moveTo(px, py);
      c.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + 2, py + Math.sin(a) * l * 0.5 - 2, px + Math.cos(a) * l, py + Math.sin(a) * l);
      c.stroke();
    });
  }
  // print dots, 8px pitch so they tile exactly
  c.fillStyle = 'rgba(58,40,28,0.15)';
  for (let y = 0; y < S; y += 8) {
    for (let x = 0; x < S; x += 8) {
      circle(c, x + 2, y + 2, 1.05); c.fill();
      circle(c, x + 6, y + 6, 1.05); c.fill();
    }
  }
  // grain: nudge colour and coverage together so it reads on light and dark alike
  const im = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
  const d = im.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.random() - 0.5;
    d[i] += n * 90; d[i + 1] += n * 90; d[i + 2] += n * 90;
    d[i + 3] += Math.abs(n) * 16;
  }
  c.putImageData(im, 0, 0);
}

/** Road surface: speckled tarmac with a few cracks and patches. Scrolls with the world. */
function drawAsphalt(c: Ctx): void {
  const S = 256;
  c.fillStyle = '#63616b';
  c.fillRect(0, 0, S, S);
  for (let i = 0; i < 16; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 20 + Math.random() * 46;
    const col = Math.random() < 0.5 ? '40,38,46' : '150,146,160';
    wrapped(S, x, y, r, (px, py) => {
      const g = c.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(${col},0.16)`);
      g.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = g;
      c.fillRect(px - r, py - r, r * 2, r * 2);
    });
  }
  for (let i = 0; i < 520; i++) {
    const x = Math.random() * S, y = Math.random() * S, r = 0.4 + Math.random() * 1.1;
    c.fillStyle = Math.random() < 0.5 ? 'rgba(30,28,34,0.5)' : 'rgba(196,192,204,0.42)';
    wrapped(S, x, y, r, (px, py) => { circle(c, px, py, r); c.fill(); });
  }
  c.strokeStyle = 'rgba(34,30,38,0.5)';
  c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    let x = 30 + Math.random() * 190, y = 30 + Math.random() * 190;
    c.beginPath();
    c.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += 6 + Math.random() * 12;
      y += (Math.random() - 0.5) * 12;
      c.lineTo(x, y);
    }
    c.stroke();
  }
  grain(c, 22);
}

/** Two layers of cut green paper for the far hills, each with a pale cut edge. */
function drawHills(c: Ctx): void {
  const ridge = (base: number, a1: number, a2: number, ph: number, col: string) => {
    const path = () => {
      c.beginPath();
      c.moveTo(-4, 134);
      for (let x = -4; x <= 516; x += 4) {
        const t = (x / 512) * Math.PI * 2;
        c.lineTo(x, base + a1 * Math.sin(t + ph) + a2 * Math.sin(t * 3 + ph * 2));
      }
      c.lineTo(516, 134);
      c.closePath();
    };
    c.save();
    c.shadowColor = 'rgba(24,16,10,0.4)';
    c.shadowBlur = 9;
    c.shadowOffsetY = -1;
    path();
    c.fillStyle = col;
    c.fill();
    c.restore();
    path();
    c.strokeStyle = '#fbf6ea';
    c.lineWidth = 2.6;
    c.stroke();
    c.save();
    path();
    c.clip();
    c.fillStyle = 'rgba(255,255,255,0.07)';
    for (let i = 0; i < 46; i++) c.fillRect(Math.random() * 512, base - 30 + Math.random() * 90, 14 + Math.random() * 30, 1.2);
    c.restore();
  };
  ridge(52, 22, 9, 0.4, '#a7cf9d');
  ridge(84, 16, 7, 2.2, '#73ae77');
}

function drawPalm(c: Ctx): void {
  c.beginPath();
  c.moveTo(34, 150);
  c.quadraticCurveTo(30, 100, 40, 50);
  c.lineTo(48, 52);
  c.quadraticCurveTo(40, 100, 46, 150);
  c.closePath();
  ink(c, '#a9743f', 2.2);
  for (const a of [-2.7, -2.1, -1.5, -0.9, -0.3, 0.2]) {
    c.save();
    c.translate(44, 50);
    c.rotate(a);
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(26, -16, 50, 4);
    c.quadraticCurveTo(26, -2, 0, 6);
    c.closePath();
    ink(c, '#3f9b5a', 2);
    c.restore();
  }
  circle(c, 44, 52, 5); ink(c, '#7a4f25', 1.8);
}

function drawBillboard(c: Ctx, top: string, bottom: string, bg: string): void {
  rr(c, 28, 80, 7, 44, 2); ink(c, '#7a6a58', 2);
  rr(c, 135, 80, 7, 44, 2); ink(c, '#7a6a58', 2);
  rr(c, 4, 4, 162, 82, 5); ink(c, bg, 2.8);
  rr(c, 10, 10, 150, 70, 3); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = INK;
  c.font = `27px ${FONT}`;
  c.fillText(top, 85, 32);
  c.font = `22px ${FONT}`;
  c.fillText(bottom, 85, 60);
}

function drawWreck(c: Ctx): void {
  c.save();
  c.translate(150, 34);
  c.rotate(-0.16);
  drawSedan(c, '#3f7fbf', '#888');
  c.restore();
  c.save();
  c.translate(6, 60);
  drawSedan(c, '#d9544d', '#888');
  // crumpled trunk + popped lid
  poly(c, [186, 40, 204, 20, 210, 44, 200, 46]);
  ink(c, shade('#d9544d', -0.15), 2.4);
  line(c, [176, 44, 184, 52, 178, 60, 190, 64], INK, 2);
  c.restore();
  star(c, 196, 92, 18, 8, 8);
  ink(c, '#ffe45c', 2);
}

function drawBurst(c: Ctx): void {
  star(c, 65, 65, 62, 36, 12);
  ink(c, '#ffd23f', 3);
  star(c, 65, 65, 40, 22, 12, -Math.PI / 2 + 0.26);
  c.fillStyle = '#ffffff';
  c.fill();
}

function drawPuff(c: Ctx): void {
  for (const [x, y, r] of [[13, 20, 10], [22, 13, 11], [30, 22, 9]]) { circle(c, x, y, r + 1.6); c.fillStyle = INK; c.fill(); }
  for (const [x, y, r] of [[13, 20, 10], [22, 13, 11], [30, 22, 9]]) { circle(c, x, y, r); c.fillStyle = '#f4f1ea'; c.fill(); }
}

function heart(c: Ctx, fill: string): void {
  c.beginPath();
  c.moveTo(15, 26);
  c.bezierCurveTo(-4, 12, 4, -2, 15, 8);
  c.bezierCurveTo(26, -2, 34, 12, 15, 26);
  c.closePath();
  ink(c, fill, 2.6);
}

function button(c: Ctx, fill: string, label: string, icon: (c: Ctx) => void): void {
  circle(c, 62, 62, 56);
  ink(c, fill, 3.4);
  c.beginPath();
  c.arc(62, 62, 48, Math.PI * 1.1, Math.PI * 1.75);
  c.strokeStyle = 'rgba(255,255,255,0.45)';
  c.lineWidth = 5;
  c.stroke();
  icon(c);
  c.font = `27px ${FONT}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.lineWidth = 5;
  c.strokeStyle = INK;
  c.fillStyle = PAPER;
  c.strokeText(label, 62, 88);
  c.fillText(label, 62, 88);
}

function speaker(c: Ctx, on: boolean): void {
  poly(c, [6, 14, 13, 14, 21, 7, 21, 31, 13, 24, 6, 24]);
  ink(c, PAPER, 2.2);
  c.strokeStyle = PAPER;
  c.lineWidth = 2.6;
  if (on) {
    c.beginPath(); c.arc(22, 19, 6, -0.9, 0.9); c.stroke();
    c.beginPath(); c.arc(22, 19, 11, -0.9, 0.9); c.stroke();
  } else {
    line(c, [26, 13, 35, 25], '#ff6b5e', 3);
    line(c, [35, 13, 26, 25], '#ff6b5e', 3);
  }
}

function tile(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void): void {
  makeArt(scene, key, w, h, draw, { ax: 0, ay: 0 });
}

export function buildTextures(scene: Phaser.Scene): void {
  const shirts = ['#5aa9e6', '#f4a261', '#8ac926', '#ff70a6', '#e9c46a', '#9d4edd', '#2a9d8f', '#ef476f'];

  CAR_COLORS.slice(0, 5).forEach((col, i) => {
    const key = `sedan${i}`;
    makeArt(scene, key, 212, 90, (c) => drawSedan(c, col, shirts[i]), { border: 2, ax: 106, ay: 88 });
    VEHICLES.sedan.push({ key, w: 212, h: 90, slots: [{ x: 92 - 106, y: 30 - 88 }] });
  });
  [CAR_COLORS[6], CAR_COLORS[5]].forEach((col, i) => {
    const key = `van${i}`;
    makeArt(scene, key, 228, 106, (c) => drawVan(c, col, shirts[5 + i]), { border: 2, ax: 114, ay: 103 });
    VEHICLES.van.push({ key, w: 228, h: 106, slots: [{ x: 64 - 114, y: 30 - 103 }] });
  });
  [CAR_COLORS[7], CAR_COLORS[2]].forEach((col, i) => {
    const key = `pickup${i}`;
    makeArt(scene, key, 234, 92, (c) => drawPickup(c, col, shirts[3 + i]), { border: 2, ax: 117, ay: 90 });
    VEHICLES.pickup.push({ key, w: 234, h: 92, slots: [{ x: 102 - 117, y: 32 - 90 }] });
  });
  makeArt(scene, 'wagon', 226, 90, drawWagon, { border: 2, ax: 113, ay: 88 });
  VEHICLES.wagon.push({ key: 'wagon', w: 226, h: 90, slots: [{ x: 182 - 113, y: 30 - 88 }] });
  makeArt(scene, 'bus', 444, 126, drawBus, { border: 2, ax: 222, ay: 123 });
  VEHICLES.bus.push({
    key: 'bus', w: 444, h: 126,
    slots: [114, 194, 274, 354].map((x) => ({ x: x - 222, y: 44 - 123 })),
  });

  makeArt(scene, 'bug', 252, 102, drawBug, { border: 2.5, ax: 126, ay: 99 });
  makeArt(scene, 'bill_torso', 72, 74, drawTorso, { border: 2.5, ax: 36, ay: 74 });
  makeArt(scene, 'bill_arm', 44, 150, drawArmBat, { border: 2.5, ax: 23, ay: 134 });

  for (let s = 0; s < HEAD_STYLES; s++) {
    const skin = SKIN[s % SKIN.length];
    makeArt(scene, `head${s}`, 56, 58, (c) => drawHead(c, skin, s, false), { border: 2.5, ax: 28, ay: 48 });
    makeArt(scene, `head${s}_dazed`, 56, 58, (c) => drawHead(c, skin, s, true), { border: 2.5, ax: 28, ay: 48 });
  }
  SKIN.forEach((skin, i) => {
    // every neck is the same pink rubber, whoever it belongs to
    tile(scene, `neck${i}`, 16, 15, (c) => {
      c.fillStyle = '#b9566a'; c.fillRect(0, 0, 16, 15);
      c.fillStyle = '#ee9aa6'; c.fillRect(0, 1.8, 16, 11.4);
      c.fillStyle = '#f8c3c9'; c.fillRect(0, 3.2, 16, 2.6);
      c.fillStyle = '#d97a89'; c.fillRect(0, 9.8, 16, 3.4);
    });
    makeArt(scene, `armphone${i}`, 66, 30, (c) => {
      rr(c, 2, 10, 46, 10, 5); ink(c, skin, 2.2);
      rr(c, 44, 2, 13, 25, 3); ink(c, '#2b2a2e', 2);
      rr(c, 46.5, 5, 8, 15, 1.5); c.fillStyle = '#7fd4ff'; c.fill();
      circle(c, 50.5, 23.5, 1.6); c.fillStyle = '#ff4d4d'; c.fill();
      circle(c, 46, 16, 6.5); ink(c, skin, 2.2);
    }, { border: 2, ax: 5, ay: 15 });
  });
  tile(scene, 'neck_dog', 16, 15, (c) => {
    c.fillStyle = INK; c.fillRect(0, 0, 16, 15);
    c.fillStyle = '#e0a94e'; c.fillRect(0, 2.2, 16, 10.6);
    c.fillStyle = '#c98f3c'; c.fillRect(0, 9.5, 16, 3.3);
  });
  makeArt(scene, 'dog', 66, 56, (c) => drawDog(c, false), { border: 2.5, ax: 42, ay: 46 });
  makeArt(scene, 'dog_mad', 66, 56, (c) => drawDog(c, true), { border: 2.5, ax: 42, ay: 46 });
  makeArt(scene, 'phone', 14, 26, (c) => {
    rr(c, 1, 1, 12, 24, 3); ink(c, '#2b2a2e', 2);
    rr(c, 3, 4, 8, 15, 1.5); c.fillStyle = '#7fd4ff'; c.fill();
  }, { border: 1.5 });

  makeArt(scene, 'sign0', 76, 106, (c) => drawSign(c, 0), { border: 2.5, ax: 38, ay: 106 });
  makeArt(scene, 'sign1', 76, 106, (c) => drawSign(c, 1), { border: 2.5, ax: 38, ay: 106 });
  makeArt(scene, 'cone', 22, 29, drawCone, { border: 1.5, ax: 11, ay: 28 });
  makeArt(scene, 'wreck', 380, 152, drawWreck, { border: 2.5, ax: 190, ay: 150 });

  makeArt(scene, 'cloud', 150, 64, drawCloud, { border: 0.6 });
  makeArt(scene, 'sun', 66, 66, (c) => {
    circle(c, 33, 33, 32); c.fillStyle = '#ffd24a'; c.fill();
    circle(c, 33, 33, 24); c.fillStyle = '#ffe07a'; c.fill();
  }, { border: 3 });
  makeArt(scene, 'palm', 100, 152, drawPalm, { border: 2, ax: 40, ay: 150 });
  makeArt(scene, 'billboard0', 170, 126, (c) => drawBillboard(c, 'EYES ON', 'THE ROAD!', '#fffaf0'), { border: 2, ax: 85, ay: 124 });
  makeArt(scene, 'billboard1', 170, 126, (c) => drawBillboard(c, 'KEEP IT', 'MOVING!', '#ffe45c'), { border: 2, ax: 85, ay: 124 });

  makeArt(scene, 'star', 26, 26, (c) => { star(c, 13, 13.5, 11.5, 5); ink(c, '#ffd23f', 2); }, { border: 1.5 });
  makeArt(scene, 'burst', 130, 130, drawBurst, { border: 2.5 });
  makeArt(scene, 'puff', 44, 36, drawPuff);
  makeArt(scene, 'spark', 12, 12, (c) => { circle(c, 6, 6, 5); c.fillStyle = '#ffffff'; c.fill(); });
  makeArt(scene, 'zone', 84, 84, (c) => {
    c.setLineDash([9, 8]);
    circle(c, 42, 42, 36);
    c.strokeStyle = '#ffffff';
    c.lineWidth = 3.4;
    c.stroke();
  });

  makeArt(scene, 'heart', 30, 28, (c) => heart(c, '#ff4d5e'), { border: 2 });
  makeArt(scene, 'heart_off', 30, 28, (c) => heart(c, '#4a4550'), { border: 2 });
  makeArt(scene, 'star_big', 84, 84, (c) => { star(c, 42, 44, 38, 17); ink(c, '#ffd23f', 3.4); }, { border: 3 });
  makeArt(scene, 'star_big_off', 84, 84, (c) => { star(c, 42, 44, 38, 17); ink(c, '#5a5560', 3.4); }, { border: 3 });
  makeArt(scene, 'snd_on', 40, 38, (c) => speaker(c, true));
  makeArt(scene, 'snd_off', 40, 38, (c) => speaker(c, false));

  makeArt(scene, 'btn_duck', 124, 124, (c) => button(c, '#3d7be0', 'DUCK', (k) => {
    poly(k, [40, 34, 62, 60, 84, 34, 84, 48, 62, 74, 40, 48]);
    ink(k, PAPER, 2.6);
  }), { border: 3 });
  const fist = (k: Ctx) => {
    rr(k, 40, 36, 44, 34, 10); ink(k, PAPER, 2.6);
    for (const x of [51, 62, 73]) line(k, [x, 37, x, 52], INK, 2);
    rr(k, 36, 50, 16, 14, 6); ink(k, PAPER, 2.4);
  };
  makeArt(scene, 'btn_rage', 124, 124, (c) => button(c, '#e2372d', 'RAGE!', fist), { border: 3 });
  makeArt(scene, 'btn_rage_off', 124, 124, (c) => button(c, '#5c5662', 'RAGE', fist), { border: 3 });

  // scrolling strips
  tile(scene, 'dash', 110, 6, (c) => { rr(c, 0, 0, 52, 6, 2); c.fillStyle = '#f4f1ea'; c.fill(); });
  tile(scene, 'rail', 72, 26, (c) => {
    rr(c, 30, 6, 8, 20, 2); ink(c, '#8d939c', 2);
    c.fillStyle = INK; c.fillRect(0, 2, 72, 12);
    c.fillStyle = '#cfd4da'; c.fillRect(0, 4, 72, 8);
    c.fillStyle = '#eef1f4'; c.fillRect(0, 5, 72, 2.4);
  });
  tile(scene, 'hills', 512, 130, drawHills);
  tile(scene, 'paper', 256, 256, drawPaper);
  tile(scene, 'asphalt', 256, 256, drawAsphalt);
  // white dots that swell toward the horizon: a printed sky gradient
  tile(scene, 'skydots', 14, 210, (c) => {
    c.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i * 7 < 214; i++) {
      const y = i * 7, r = 0.2 + 3.1 * Math.pow(y / 210, 1.6);
      for (const x of [i % 2 === 0 ? 3.5 : 10.5, i % 2 === 0 ? 17.5 : -3.5]) { circle(c, x, y, r); c.fill(); }
    }
  });
  // soft shadow where one sheet of paper sits on another
  tile(scene, 'edge', 8, 14, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 14);
    g.addColorStop(0, 'rgba(24,16,10,0)');
    g.addColorStop(1, 'rgba(24,16,10,0.34)');
    c.fillStyle = g;
    c.fillRect(0, 0, 8, 14);
  });
  tile(scene, 'grass', 64, 18, (c) => {
    c.fillStyle = '#5c9f5e'; c.fillRect(0, 4, 64, 14);
    c.fillStyle = INK; c.fillRect(0, 3, 64, 2.2);
    for (let x = 4; x < 64; x += 13) { poly(c, [x, 5, x + 3, -1, x + 6, 5]); ink(c, '#5c9f5e', 1.6); }
  });
}
