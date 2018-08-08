
var JS = {
    VERSION: '2.2.1'
};

JS.Class = function(classDefinition) {
    // 使用/\b_super\b/ 来检测函数里面有没有._super语句
    var fnTest = /xyz/.test(function() {xyz;})? /\b_super\b/ : /.*/;

    //返回目标类的真正构造器
    function getClassBase() {
        return function() {
            //它在里面执行用户传入的构造器construct
            //preventJSBaseConstructorCall是为了防止在createClassDefinition辅助方法中执行父类的construct
            if (typeof this['construct'] === 'function' && preventJSBaseConstructorCall === false) {
                this.construct.apply(this, arguments);
            }
        };
    }

    function extend(destination, source) {
        for (const property in source) {
            destination[property] = source[property];
        }
        return destination
    }

    //为目标类添加类成员与原型成员
    function createClassDefinition(classDefinition) {
        //此对象用于保存父类的同名方法
        var parent = this.prototype["parent"] || (this.prototype["parent"] = {});
        var _prototypeUseInScope = extend({}, this.prototype);

        for (var prop in classDefinition) {
            if (prop === 'statics') {
                for (var sprop in classDefinition.statics) {
                    this[sprop] = classDefinition.statics[sprop];
                }
            } else {
                //为目标类添加原型成员，如果是函数，那么检测它还没有同名的超类方法，如果有
                // if (typeof this.prototype[prop] === 'function') {
                //     var parentMethod = this.prototype[prop];
                //     parent[prop] = parentMethod;
                // }
                if (typeof classDefinition[prop] === 'function' && typeof this.prototype[prop] === 'function' && fnTest.test(classDefinition[prop])) {
                    this.prototype[prop] = (function(name, fn){
                        return function() {
                            var tmp = this._super;
                            console.log(tmp);
                            this._super = _prototypeUseInScope[name];
                            parent[name] = _prototypeUseInScope[name];
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;
                            return ret;
                        };
                    })(prop, classDefinition[prop]);
                } else {
                    this.prototype[prop] = classDefinition[prop];
                }
            }
        }
    }

    var preventJSBaseConstructorCall = true;
    var Base = getClassBase();
    preventJSBaseConstructorCall = false;

    createClassDefinition.call(Base, classDefinition);

    //用于创建当前类的子类
    Base.extend = function(classDefinition) {

        preventJSBaseConstructorCall = true;
        var SonClass = getClassBase();
        SonClass.prototype = new this();//将一个父类的实例当作子类的原型
        preventJSBaseConstructorCall = false;

        createClassDefinition.call(SonClass, classDefinition);
        SonClass.extend = this.extend;

        return SonClass;
    };
    return Base;
};