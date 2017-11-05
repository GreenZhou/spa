1. 变量提升
当变量被声明时，声明会被提升到它所在函数的顶部，并被赋予undefined值，而初始化仍旧在原来的地方。
例子：
var regular_joe = 'hello';
function prison() {
	console.log(regular_joe);// print undefined
	var regular_joe = 'hello world!';
}

2. 使用锚来驱动应用状态
a. $.uriAnchor.setAnchor(anchor_map, option_map, replace_flag), 其中anchor_map: 这个映射会被编码到URL中；option_map: 映射的选项
；replace_flag: 布尔值.当为ture时,这个方法会替换掉URI,所以前一个URL不会出现在浏览器的历史中
b. $.uriAnchor.configModule({chat: {open: true, closed: true}}), 表示chat有两个属性open和closed， 并且open和closed的属性值也不一定要为true，只要为真即可
c. $.uriAnchor.makeAnchorMap(), 分析URL并生成一个映射,这个方法会在返回的映射里面为带有依赖值的独立值创建额外的键_s_<indendent_arg>,这些额外的键的值是一个独立值后面跟着所有的依赖值.如：
#!page=profile:uname,wendy|online,true&slider=confirm:text,hello|pretty,false&color=red
输出如下：
{ page : 'profile',
  _page : {
    uname   : 'wendy',
    online  : 'true'
  },
  _s_page : 'profile:uname,wendy|online,true',
  slider  : 'confirm',
  _slider : {
   text   : 'hello',
   pretty : false
  },
  _s_slider : 'confirm:text,hello|pretty,false',
  color : 'red'
  }
  具体来自于： http://blog.csdn.net/fengyinchao/article/details/50642941