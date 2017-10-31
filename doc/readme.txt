1. 变量提升
当变量被声明时，声明会被提升到它所在函数的顶部，并被赋予undefined值，而初始化仍旧在原来的地方。
例子：
var regular_joe = 'hello';
function prison() {
	console.log(regular_joe);// print undefined
	var regular_joe = 'hello world!';
}