import { view } from '../../config';
import { Mini } from '../Mini';
import { Diner, PAPILLON, Talk, Waiter, layPapillon, onTable, setTable } from '../shared/papillon';

/** LE PAPILLON. (A first look at the room: the game itself comes next.) */
export class PapillonMini extends Mini {
  readonly title = 'LE PAPILLON';
  readonly prompt = 'ORDER FOR BILL!';
  readonly seconds = 12;

  private talk!: Talk;
  bill!: Diner;
  steph!: Diner;
  christian!: Diner;
  waiter!: Waiter;

  get said() {
    return this.talk.said;
  }

  build(): void {
    const s = this.scene, cx = view.W / 2;
    this.talk = new Talk(s);
    layPapillon(s);
    setTable(s, cx);
    this.bill = new Diner(s, 'bill', cx - 210, 'calm');
    this.christian = new Diner(s, 'christian', cx, 'smug');
    this.steph = new Diner(s, 'stephanie', cx + 210, 'smile');
    this.waiter = new Waiter(s, cx - 380);
    onTable(s, 'papillon_candle', cx - 100, 8);
    onTable(s, 'papillon_rose', cx + 104, 8);
    for (const d of [this.bill, this.christian, this.steph]) {
      onTable(s, 'papillon_plate', d.x);
      onTable(s, 'papillon_glass_red', d.x + 62, 6);
    }
    void PAPILLON;
  }

  update(dt: number): void {
    this.talk.update(dt);
  }

  timeUp(): boolean {
    return true;
  }
}
