/**************************************************************
             _____                    _____                            _____
            /\    \                  /\    \                          /\    \
           /::\____\                /::\____\                        /::\____\
          /:::/    /               /:::|    |                        |::|    |
         /:::/    /               /::::|    |                        |::|    |
        /:::/    /               /:::::|    |                        |::|    |
       /:::/    /               /::::::|    |                        |::|    |
      /:::/    /               /:::/|::|    |                        |::|    |
     /:::/    /               /:::/ |::|____|______                  |::|____|____________
    /:::/    /               /:::/  |:::::::::\    \                 |::::::::::::::::|   |
   /:::/    /               /:::/   |::::::::::\____\                /::::::::::::::::|   |
  /:::/    /                \::/    /￣￣￣/:::/    /               /:::/￣￣/￣￣￣￣￣￣
 /:::/____/                  \/____/      /:::/    /               /:::/    /
 \:::\    \                              /:::/    /               /:::/    /
  \:::\    \                            /:::/    /               /:::/    /
   \:::\    \                          /:::/    /               /:::/    /
    \:::\    \                        /:::/    /               /:::/    /
     \:::\    \                      /:::/    /               /:::/    /
      \:::\____\                    /:::/    /               /:::/    /
       \::/    /                    \::/    /                \::/    /
        \/____/                      \/____/                  \/____/

 @Name:     trajectory
 @Author:   ⒏惹我
 @Date:     2018-10-10
 @QQ:       443119044
 @Note:     本脚本仅限个人使用及经本人同意者使用。如未经过本人允许用于第三方任何用途，第三方使用者一辈子吃泡面没有面.
 @version:  1.0版本 —— 配合高德地图做轨迹播放功能

*************************************************************/

export default class lmyMapTrajectory {
  constructor() {
    //默认配置
    this.config = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      color: "#f00",
      actionColor: "#3a8ce9",
      speed: 600,
      lineWidth: 2,
      curveness: 0.2,
      historyData: null
    }

    this.canvas = document.createElement("canvas");
    this.canvasCtx = this.canvas.getContext('2d');

    this.banAnimate = false;
  }

  /**
   * 初始化构建
   * @param  {Array<number>} setings 配置
   * @param  {Number} start 起点
   * @param  {Number} end 终点
   * @param  {Number} animateStart 动画开始
   */
  initData(setings, start, end, animateStart) {
    // 控制禁止之前动画
    this.banAnimate = end === animateStart;

    let _this = this;
    let _config = Object.assign(this.config, setings);

    if (setings.pathList.length > 1) {
      // 初始化数据
      _this.canvas.width = _config.width;
      _this.canvas.height = _config.height;
      _config.imgData = null;
      _config.pathList = _config.pathList.map(item => [item.x, item.y]);
      this.empty();

      // 开始递归轨迹
      let recursion = function (index) {
        _this.animate(
          _this.canvas,
          _this.canvasCtx,
          index,
          index >= animateStart,
          index + 1 === end,
          function () {
            if (index + 1 < end) {
              _config.imgData = _this.canvasCtx.getImageData(0, 0, _config.width, _config.height);
              recursion(index + 1);
            }
          }
        );
      }
      recursion(start);
    }
  }

  /**
   * 清空轨迹
   */
  empty() {
    // 清空画布
    this.canvasCtx.clearRect(0, 0, this.config.width, this.config.height);
  }

  /**
   * 轨迹动画
   * @param  {Dom} canvas canvas实例
   * @param  {Object} ctx canvas渲染上下文
   * @param  {number} index 第几条轨迹
   * @param  {Boolean} isAction 是否开启动画
   * @param  {Boolean} isEnd 是否最后一条轨迹
   * @param  {function} fn 轨迹结束回调
   * @param  {number} percent 动画进度
   */
  animate(canvas, ctx, index, isAction, isEnd, fn, percent) {
    // 判断是否停止动画
    if (this.banAnimate && isAction) {
      this.banAnimate = false;
      return;
    }

    let _config = this.config;
    percent = isAction ? percent || 0 : 100;

    this.drawCurvePath(
      canvas,
      ctx,
      _config.pathList[index],
      _config.pathList[index + 1],
      isAction || isEnd ? _config.actionColor : _config.color,
      _config.curveness,
      percent
    );

    percent++;

    if (percent <= 100) {
      setTimeout(() => {
        this.animate(canvas, ctx, index, isAction, isEnd, fn, percent)
      }, _config.speed / 100);
    } else {
      fn && fn();
    }
  }

  /**
   * 绘制一条曲线路径
   * @param  {Dom} canvas canvas实例
   * @param  {Object} ctx canvas渲染上下文
   * @param  {Array<number>} start 起点
   * @param  {Array<number>} end 终点
   * @param  {String} color 颜色
   * @param  {number} curveness 曲度(0-1)
   * @param  {number} percent 绘制百分比(0-100)
   */
  drawCurvePath(canvas, ctx, start, end, color, curveness, percent) {
    let _config = this.config;
    let cp = [
      (start[0] + end[0]) / 2 - (start[1] - end[1]) * curveness,
      (start[1] + end[1]) / 2 - (end[0] - start[0]) * curveness
    ];

    let t = percent / 100;

    let p0 = start;
    let p1 = cp;
    let p2 = end;

    let v01 = [p1[0] - p0[0], p1[1] - p0[1]];     // 向量<p0, p1>
    let v12 = [p2[0] - p1[0], p2[1] - p1[1]];     // 向量<p1, p2>

    let q0 = [p0[0] + v01[0] * t, p0[1] + v01[1] * t];
    let q1 = [p1[0] + v12[0] * t, p1[1] + v12[1] * t];

    let v = [q1[0] - q0[0], q1[1] - q0[1]];       // 向量<q0, q1>

    let b = [q0[0] + v[0] * t, q0[1] + v[1] * t];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _config.imgData && ctx.putImageData(_config.imgData, 0, 0);

    ctx.beginPath();
    ctx.lineWidth = _config.lineWidth;
    ctx.strokeStyle = color;
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo(
      q0[0], q0[1],
      b[0], b[1]
    );
    ctx.stroke();

    // 生成箭头
    var angle = 19.2;
    var d = 20;
    angle = typeof (angle) != 'undefined' ? angle : Math.PI / 9;
    d = typeof (d) != 'undefined' ? d : 10;
    var lineangle = Math.atan2(b[1] - q0[1], b[0] - q0[0]);
    var h = Math.abs(d / Math.cos(angle));

    var angle1 = lineangle + Math.PI + angle;
    var hornT = [b[0] + Math.cos(angle1) * h, b[1] + Math.sin(angle1) * h];
    var angle2 = lineangle + Math.PI - angle;
    var hornB = [b[0] + Math.cos(angle2) * h, b[1] + Math.sin(angle2) * h];
    this.drawHead(ctx, hornT, b, hornB, 4, color, 1);
  }



  // From: http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
  /** 绘制箭头
   * @param  {Object} ctx canvas渲染上下文
   * @param  {Array<number>} hornT 
   * @param  {Array<number>} point 
   * @param  {Array<number>} hornB 
   * @param  {number} style 样式
   * @param  {number} color 颜色
   * @param  {number} width 宽度
   */
  drawHead(ctx, hornT, point, hornB, style, color, width) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(hornT[0], hornT[1]);
    ctx.lineTo(point[0], point[1]);
    ctx.lineTo(hornB[0], hornB[1]);

    switch (style) {
      case 0:
        var backdist = Math.sqrt(((hornB[0] - hornT[0]) * (hornB[0] - hornT[0])) + ((hornB[1] - hornT[1]) * (hornB[1] - hornT[1])));
        ctx.arcTo(point[0], point[1], hornT[0], hornT[1], .55 * backdist);
        ctx.fill();
        break;
      case 1:
        ctx.beginPath();
        ctx.moveTo(hornT[0], hornT[1]);
        ctx.lineTo(point[0], point[1]);
        ctx.lineTo(hornB[0], hornB[1]);
        ctx.lineTo(hornT[0], hornT[1]);
        ctx.fill();
        break;
      case 2:
        ctx.stroke();
        break;
      case 3:
        var cpx = (hornT[0] + point[0] + hornB[0]) / 3;
        var cpy = (hornT[1] + point[1] + hornB[1]) / 3;
        ctx.quadraticCurveTo(cpx, cpy, hornT[0], hornT[1]);
        ctx.fill();
        break;
      case 4:
        var cp1x, cp1y, cp2x, cp2y, backdist;
        var shiftamt = 3;
        if (hornB[0] == hornT[0]) {
          backdist = hornB[1] - hornT[1];
          cp1x = (point[0] + hornT[0]) / 2;
          cp2x = (point[0] + hornT[0]) / 2;
          cp1y = point[1] + backdist / shiftamt;
          cp2y = point[1] - backdist / shiftamt;
        } else {
          backdist = Math.sqrt(((hornB[0] - hornT[0]) * (hornB[0] - hornT[0])) + ((hornB[1] - hornT[1]) * (hornB[1] - hornT[1])));
          var xback = (hornT[0] + hornB[0]) / 2;
          var yback = (hornT[1] + hornB[1]) / 2;
          var xmid = (xback + point[0]) / 2;
          var ymid = (yback + point[1]) / 2;
          var m = (hornB[1] - hornT[1]) / (hornB[0] - hornT[0]);
          var dx = (backdist / (2 * Math.sqrt(m * m + 1))) / shiftamt;
          var dy = m * dx;
          cp1x = xmid - dx;
          cp1y = ymid - dy;
          cp2x = xmid + dx;
          cp2y = ymid + dy;
        }
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, hornT[0], hornT[1]);
        ctx.fill();
        break;
    }
    ctx.restore();
  }
}