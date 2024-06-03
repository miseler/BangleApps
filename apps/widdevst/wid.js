(() => {
  let stat = {date: 0};
  let d = Date.now();
  let settings = require("Storage").readJSON("widdevst.settings.json", 1)||{};
  let redrawBars = "redrawBars" in settings ? settings.redrawBars : false;
  delete settings;

  WIDGETS.devst = {area: "tr", width: 22, draw: function() {
    d = Date.now();
    if (WIDGETS.devst._draw) return;
    let x = this.x;
    let y = this.y;
    g.reset();
    g.clearRect(x, y, x + 21, y + 23);
    g.setFont('6x8', 1);
    let again = false;
    let toggleForce = true;
    if (NRF.getSecurityStatus().connected || toggleForce) g.drawString('B', x + 5, y + 3), again = true;
    if (Bangle.isCompassOn() || toggleForce) g.drawString('C', x + 13, y + 3), again = true;
    if (Bangle.isGPSOn() || toggleForce) g.drawString('G', x + 5, y + 12), again = true;
    if (Bangle.isHRMOn() || toggleForce) g.drawString('H', x + 13, y + 12), again = true;

    if(mode==0) { // RAM & storage bars
      let t;
      if ((d - stat.date) < 6e4) {
        t = process.memory(false);
      } else {
        stat.date = d;
        t = require('Storage').getStats();
        stat.sto = t.fileBytes / t.totalBytes;
        t = process.memory();
      }
      t = t.usage / t.total;

      g.drawRect(x + 2, y + 1, x + 20, y + 21);
      g.setColor(col(stat.sto)); g.drawRect(x + 2, y + 21, x + 2 + stat.sto * 18, y + 22);
      g.setColor(col(t)); g.drawRect(x + 1, y + 21 - t * 20, x + 2, y + 21);
    }
    else if(mode==1) { // battery gauge
      let b = E.getBattery(); b=80;
      let corner = 4;
      if(b <= 65) {g.drawLine(x+21-corner, y+0, x+21, y+0);g.drawLine(x+21, y+1, x+21, y+corner);}
      if(b <= 40) {g.drawLine(x+21-corner, y+22, x+21, y+22);g.drawLine(x+21, y+22-corner, x+21, y+21);}
      if(b <= 15) {g.drawLine(x+corner, y+22, x+0, y+22);g.drawLine(x+0, y+22-corner, x+0, y+21);}
      setColor(b);
      let top = E.clip(b-75, 0, 25);
      let right = E.clip(b-50, 0, 25);
      let bottom = E.clip(b-25, 0, 25);
      let left = E.clip(b, 0, 25);
      if(top>0) g.drawRect(x+1,y+0,x+1+20*top/25,y+1);
      if(right>0) g.drawRect(x+20,y+0,x+21,y+22*right/25);
      if(bottom>0) g.drawRect(x+1,y+21,x+1+20*bottom/25,y+22);
      if(left>0) g.drawRect(x+1,y+0,x+2,y+22*left/25);
    }

    // if there's nothing active, don't queue a redraw (rely on Bangle.on(...) below)
    if (redrawBars || again) setTimeout(draw, drawTime());
  }};

  function col(p) {
    return p < 0.5 ? '#0f0' : (p < 0.8 ? '#f80' : '#f00');
  }

  function setColor(b) {
    if(Bangle.isCharging()) g.setColor('#00f');
    else g.setColor(b > 50 ? '#0f0' : (b > 25 ? '#f80' : '#f00'));
  }

  let draw = WIDGETS.devst.draw.bind(WIDGETS.devst);

  let drawTime = () => Bangle.isLocked() ? 6e4 : 2e3;    // TODO: human readable?
  let throttledDraw = () => Date.now() - d > drawTime() && draw();

  Bangle.on("HRM", throttledDraw);
  Bangle.on("GPS", throttledDraw);
  Bangle.on("mag", throttledDraw);
  NRF.on("connect", throttledDraw);
  draw();
})();
