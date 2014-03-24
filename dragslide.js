
/****制作者：封阳葵***/
!function(win){
	var baseMeth = {
		getByClass : function(oParent,sClass){
			var aEle = oParent.getElementsByTagName('*');
			var arr = [];
			for(var i=0;i<aEle.length;i++){
				if(aEle[i].className == sClass){
					arr.push(aEle[i]);
				}
			}
			return arr;
		},
		$ : function(id){
			return document.getElementById(id);
		},
		addEvent : function(elem,type,fn){
			if(elem.attachEvent){
				elem.attachEvent('on'+type,fn);
			}else if(elem.addEventListener){
				elem.addEventListener(type,fn,false);
			}else{
				elem['on'+type] = fn;
			}
		},
		removeEvent: function(elem, type, fn){
            if (elem.removeEventListener) {
                elem.removeEventListener(type, fn, false);
            }else if(elem.detachEvent){
                elem.detachEvent('on'+type, fn);
            }else{
                elem['on'+type] = null;
            }
        },
		getStyle : function(elem,attr){
			if(elem.currentStyle){
				return elem.currentStyle[attr];
			}else{
				return getComputedStyle(elem, false)[attr];
			}
		},
		animate : function(elem, json, fn){
			clearInterval(elem.timer);
			elem.timer=setInterval(function (){
				var bStop=true;	
				for(var attr in json){
					var iCur=0;
					if(attr=='opacity'){
						iCur=parseInt(parseFloat(baseMeth.getStyle(elem, attr))*100);
					}else{
						iCur=parseInt(baseMeth.getStyle(elem, attr));
					}
					var iSpeed=(json[attr]-iCur)/8;
					iSpeed=iSpeed>0?Math.ceil(iSpeed):Math.floor(iSpeed);
					if(iCur!=json[attr]){
						bStop=false;
					}
					if(attr=='opacity'){
						elem.style.filter='alpha(opacity:'+(iCur+iSpeed)+')';
						elem.style.opacity=(iCur+iSpeed)/100;
					}else{
						elem.style[attr]=iCur+iSpeed+'px';
					}
				}
				if(bStop){
					clearInterval(elem.timer);
					if(fn){
						fn();
					}
				}
			}, 30)
		},
		extend : function(define,source){
			for(var property in source){
				define[property] = source[property];
			}
			return define;
		}
	}
	
	var doc = win.document;
	/**
	  *@param oParent 父类容器、slider整体
	  *@param slideWrap 图片容器
	  *@param slideaDiv 存放图片的div
	  *@param enableTab 是否启用tab切换功能、默认启用
	  *@param enableDrag 是否启用拖拽功能、默认启用
	  *@param startX 开始按下的鼠标位置
	  *@param endX 鼠标离开时的鼠标位置
	  *@param index 开始下标
	  *@param l slideWrap容器的left值
	  *@param dragSpeed 拖动多少像素开始跳到下一张
	  *@param time tab切换的时间
	*/
	var slide = function(opts){
		this.oParent = opts.oParent;
		this.slideWrap = opts.slideWrap;
		this.slideaDiv = opts.slideWrap.getElementsByTagName('div');
		this.slideaLi = opts.slideIcon.getElementsByTagName('li');
		this.enableTab = opts.enableTab;//是否启用自动播放
		this.enableDrag = opts.enableDrag;//是否启用拖拽
		this.selClass = opts.selClass;//选中的class元素
		this.startX = 0;//记录鼠标按下位置
		this.endX = 0;//记录鼠标抬起位置
		this.index = 0;//开始下表
		this.l = 0;//容器的left值
		this.dragSpeed = opts.dragSpeed;//拖动多少像素开始跳到下一张
		this.timer = null;
		this.time = opts.time;
		this.init();
	}
	slide.prototype = {
		init : function(){//初始化
			this.slideWrap.style.width = this.slideWrap.offsetWidth+'px';
			var navigator = window.navigator.userAgent;
			if(this.enableDrag){
				this.drag();	
			}
			if(this.enableTab){
				this.tab();		
			}
			this.registered();
		},
		registered : function(){
			var _this = this;
			for(var i=0;i<this.slideaLi.length;i++){
				this.slideaLi[i].index = i;
				this.slideaLi[i].onmouseover = function(){
					clearInterval(_this.timer);
					for(var i=0;i<_this.slideaLi.length;i++){
						_this.slideaLi[i].className = '';
					}
					_this.l = -this.index*_this.slideaDiv[0].offsetWidth;
					baseMeth.animate(_this.slideWrap,{'left':_this.l});	
					this.className = _this.selClass;
				}
				this.slideaLi[i].onmouseout = function(){
					_this.index = this.index;
					if(_this.enableTab){
						_this.tab();		
					}
				}
			}
		},
		
		drag : function(){//拖拽
			var _this = this;
			this.slideWrap.onmousedown = this.slideWrap.ontouchstart = function(ev){
				var oEvent=ev||event;
				if(this.setCapture){
					this.setCapture();
				}
				_this.startX = ev.targetTouches ? ev.targetTouches[0].pageX : oEvent.clientX;
				var disX = ev.targetTouches ? ev.targetTouches[0].pageX - _this.slideWrap.offsetLeft : oEvent.clientX-_this.slideWrap.offsetLeft;
				doc.onmousemove = _this.slideWrap.ontouchmove = function(ev){
					var oEvent=ev||event;
					var l = ev.targetTouches ? ev.targetTouches[0].pageX - disX : oEvent.clientX - disX;
					if(l>=(_this.slideaDiv[0].offsetWidth/3)){
						l = (_this.slideaDiv[0].offsetWidth/3);
					}else if(l<=-(_this.slideaDiv.length*_this.slideaDiv[0].offsetWidth-(_this.dragSpeed*2))){
						l = -(_this.slideaDiv.length*_this.slideaDiv[0].offsetWidth-(_this.dragSpeed*2));
					}
					_this.slideWrap.style.left = l +'px';
					if(_this.slideWrap.timer){
						clearInterval(_this.slideWrap.timer);
					}
					if(_this.timer){
						clearInterval(_this.timer);
					}
				}
				doc.onmouseup = _this.slideWrap.ontouchend = function(ev){
					var oEvent=ev||event;
					if(_this.slideWrap.releaseCapture){
						_this.slideWrap.releaseCapture();
					}
					_this.endX = ev.targetTouches ? ev.targetTouches[0].pageX : oEvent.clientX;
					doc.onmousemove = null;
					doc.onmouseup = null;
					_this.slideWrap.ontouchmove = null;
					_this.slideWrap.ontouchend = null;
					_this.pos();
					if(_this.enableTab){
						_this.tab();		
					}
				}
				return false;
			};
			
		},
		//计算位置
		pos : function(){
			if((this.endX - this.startX) >= 0){
				if((this.endX - this.startX) >= this.dragSpeed){
					if(this.index == 0){
						this.index = 0;
					}else{
						this.index--;
					}
					for(var i=0;i<this.slideaLi.length;i++){
						this.slideaLi[i].className = '';
					}
					this.l = -this.index*this.slideaDiv[0].offsetWidth;
					this.slideaLi[this.index].className = this.selClass;
					baseMeth.animate(this.slideWrap,{'left':this.l});
				}else{
					baseMeth.animate(this.slideWrap,{'left':this.l});
				}
			}else{
				if((this.endX - this.startX) <= -this.dragSpeed){
					if(this.index == this.slideaDiv.length-1){
						this.index = this.slideaDiv.length-1;
						this.l = this.index*this.slideaDiv[0].offsetWidth;
					}else{
						this.index++;
					}
					
					for(var i=0;i<this.slideaLi.length;i++){
						this.slideaLi[i].className = '';
					}
					this.l = -this.index*this.slideaDiv[0].offsetWidth;
					this.slideaLi[this.index].className = this.selClass;
					baseMeth.animate(this.slideWrap,{'left':this.l});
				}else{
					baseMeth.animate(this.slideWrap,{'left':this.l});
				}
			}
			
		},
		tab : function(){
			clearInterval(this.timer);
			var _this = this;
			this.timer = setInterval(function(){
				if(_this.index == _this.slideaDiv.length-1){
					_this.index = -1;
				}
				_this.index++;
				_this.l = -_this.index*_this.slideaDiv[0].offsetWidth;
				for(var i=0;i<_this.slideaLi.length;i++){
					_this.slideaLi[i].className = '';
				}
				_this.slideaLi[_this.index].className = _this.selClass;
				baseMeth.animate(_this.slideWrap,{'left': _this.l});
			},this.time);
		}
	}
	var defaults = {
		oParent : baseMeth.$('slide'),
		slideWrap : baseMeth.getByClass(baseMeth.$('slide'),'slide-wrap')[0],
		slideIcon : baseMeth.getByClass(baseMeth.$('slide'),'slide-icon')[0],
		dragSpeed : 300,
		time : 2000,
		enableTab : true,
		enableDrag : true,
		selClass : 'active'
	}
	win.slide = function(opts){
		opts = baseMeth.extend(defaults,opts);
		new slide(opts);
	}
}(window);
slide();
