(() => {
  var stat = {date: 0};
  var d = Date.now();
  var settings = require("Storage").readJSON("widdevst.settings.json", 1)||{};
  var redrawBars = "redrawBars" in settings ? settings.redrawBars : false;
  delete settings;

  WIDGETS.devst = {area: "tr", width: 22, draw: function() {
    d = Date.now();
    if (WIDGETS.devst._draw) return;
    /*
    var t;
    if ((d - stat.date) < 6e4) {
      t = process.memory(false);
    } else {
      stat.date = d;
      t = require('Storage').getStats();
      stat.sto = t.fileBytes / t.totalBytes;
      t = process.memory();
    }
    t = t.usage / t.total;
    */
    var b = E.getBattery();
    var x = this.x;
    var y = this.y;
    g.reset();
    // Render inside the box this.x, this.y, this.x + this.width-1, this.y + 23
    g.clearRect(x, y, x + 21, y + 23);
    /*
    g.drawRect(x + 2, y + 1, x + 20, y + 21);
    /*/
    b=100;
    if(b>=75) g.drawRect(x+1,y+0,x+21,y+1);
    if(b>=50) g.drawRect(x+20,y+0,x+21,y+22);
    if(b>=25) g.drawRect(x+1,y+21,x+21,y+22);
    g.drawRect(x+1,y+0,x+2,y+22);
    //*/
    // TODO: why rect and not line?
    g.setFont('6x8', 1);
    var again = false;
    var toggleForce = true;
    if (NRF.getSecurityStatus().connected || toggleForce) g.drawString('B', x + 5, y + 3), again = true;
    if (Bangle.isCompassOn() || toggleForce) g.drawString('C', x + 13, y + 3), again = true;
    if (Bangle.isGPSOn() || toggleForce) g.drawString('G', x + 5, y + 12), again = true;
    if (Bangle.isHRMOn() || toggleForce) g.drawString('H', x + 13, y + 12), again = true;
    //g.setColor(col(stat.sto)); g.drawRect(x + 2, y + 21, x + 2 + stat.sto * 18, y + 22);
    //g.setColor(col(t)); g.drawRect(x + 1, y + 21 - t * 20, x + 2, y + 21);
    // if there's nothing active, don't queue a redraw (rely on Bangle.on(...) below)
    if (redrawBars || again) setTimeout(draw, drawTime());
  }};

  function col(p) {
    return p < 0.5 ? '#0f0' : (p < 0.8 ? '#f80' : '#f00');
  }

  var draw = WIDGETS.devst.draw.bind(WIDGETS.devst);

  var drawTime = () => Bangle.isLocked() ? 6e4 : 2e3;    // TODO: human readable?
  var throttledDraw = () => Date.now() - d > drawTime() && draw();

  Bangle.on("HRM", throttledDraw);
  Bangle.on("GPS", throttledDraw);
  Bangle.on("mag", throttledDraw);
  NRF.on("connect", throttledDraw);
  draw();
})();
