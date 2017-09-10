// 编译es6
fis.match('**.tsx', {
	parser: 'babel2',
	rExt: '.js'
})
// 编译less
fis.match('**.less', {
	parser: 'less',
	rExt: '.css'
})