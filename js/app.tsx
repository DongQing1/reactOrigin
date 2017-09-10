// 解构
let { Component, PropTypes } = React;
let { render } = ReactDOM;
class Util extends Component {
	/***
	 * ajax异步请求方法
	 * @url 	表示请求地址
	 * @fn 		表示请求回调函数
	 ****/
	ajax(url, fn) {
		let xhr = new XMLHttpRequest();
		// 订阅事件
		xhr.onreadystatechange = () => {
			// 判断状态
			if (xhr.readyState === 4) {
				// 判断状态码
				if (xhr.status === 200) {
					// 执行回调函数
					fn(JSON.parse(xhr.responseText))
				}
			}
		}
		// 打开请求
		xhr.open('GET', url, true);
		// 发送数据
		xhr.send(null);
	}
	/**
	 * 将对象转化成jquery
	 * @url 	表示地址
	 * @obj 	参数对象
	 * return 	query地址
	 * eg: ('demo.json', {color: 'red', num: 100}) => demo.json?color=red&num=100&a=b&key=value
	 **/
	objectToQuery(url, obj) {
		// 定义结果
		let result = '';
		// 遍历obj
		for (var i in obj) {
			// i 表示key， obj[i] 表示value
			result += '&' + i + '=' + obj[i]
		}
		// 从第二个开始截取
		return url + '?' + result.slice(1);
	}
}

// 定义列表页组件
class List extends Component {
	// 定义回调函数
	showDetail(id) {
		this.props.method(id)
	}
	createList() {
		return this.props.data.map((obj, index) => {
			return (
				<li key={index} data-id={obj.id} onClick={this.showDetail.bind(this, obj.id)}>
					<img src={obj.img} alt="" />
					<div className="content">
						<h3>{obj.title}</h3>
						<p>
							<span>{obj.content}</span>
							<span className="list-comments">{'评论:' + obj.comment}</span>
						</p>
					</div>
				</li>
			)
		})
	}
	render() {
		return (
			<section className="list">
				<ul>{this.createList()}</ul>
			</section>
		)
	}
}
// 定义详情页组件
class Detail extends Component {
	// 定义事件回调函数
	showComments(id, e) {
		// 将新闻id传递给父组件
		this.props.method(this.props.data.id)
	}
	render() {
		// 缓存变量
		let data = this.props.data;
		// 定义内容
		let content = {
			__html: data.content
		}
		return (
			<section className="detail">
				<h1>{data.title}</h1>
				<p className="status"><span>{data.time}</span><span className="detail-comments">{'评论:' + data.comment}</span></p>
				<img src={data.img} alt="" />
				<p className="content" dangerouslySetInnerHTML={content}></p>
				<div className="btn" data-id={data.id} onClick={this.showComments.bind(this, data.id)}>查看更多评论</div>
			</section>
		)
	}
}
// 评论页组件
class Comments extends Util {
	// 初始化状态
	constructor(props) {
		// 构造函数继承
		super(props);
		// 初始化状态
		this.state = {
			// 用属性数据，初始化状态
			list: [],
			id: 0
		}
	}
	// 存在期要更新状态
	componentWillReceiveProps(props) {
		// 用属性数据，更新状态数据
		this.setState({
			list: props.data.list,
			id: props.data.id
		})
	}
	// 如果 props.data是undefined。我们要阻止更新
	shouldComponentUpdate(props) {
		// false 阻止更新
		return props.data.list != undefined;
	}
	// 创建列表方法
	createList() {
		return this.state.list.map((obj, index) => {
			return (
				<li key={index}>
					<h3>{obj.user}</h3>
					<p>{obj.content}</p>
					<span>{obj.time}</span>
				</li>
			)
		})
	}
	// 提交事件回调函数
	submitComments() {
		// 1 为提交按钮绑定事件
		// 2 获取输入框的内容（信息）
		var val = this.refs.userInput.value;
		// 3 脏值检测（校验）,全是空白符和什么都没有输入都不合法
		if (/^\s*$/.test(val)) {
			// 校验失败：提示错误，阻止后面的操作
			alert('请输入数据！');
			return ;
		}
		// 4 校验成功：创建数据
		let date = new Date();
		let data = {
			id: this.state.id,
			user: '小红',
			content: val,
			time: '刚刚 ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
		}
		// 5 发送请求，提交数据
		this.ajax(this.objectToQuery('data/addComment.json', data), res => {
			// 6 提交完成，提示用户
			if (res && res.errno === 0) {
				alert('success')
				// 7 提示完毕，显示内容
				// 更新状态
				let list = this.state.list;
				// 前叉数据
				list.unshift(data);
				// 更新数据
				this.setState({
					list: list
				})
				// 清空输入框
				this.refs.userInput.value = '';
			}
		})
	}
	render() {
		return (
			<section className="comments">
				<div className="input-box">
					{/*一会尝试约束性组件*/}
					<textarea ref="userInput" placeholder="文明上网，理性发言！"></textarea>
				</div>
				<div className="btn-box"><span onClick={this.submitComments.bind(this)} className="btn">提交</span></div>
				<ul>{this.createList()}</ul>
			</section>
		)
	}
}

// 定义组件
class App extends Util {
	// 定义初始化状态数据
	constructor(props) {
		// 构造函数继承
		super(props);
		// 定义初始化状态
		this.state = {
			// 控制页面的显隐
			section: 'list',
			// list数据
			list: [],
			// 详情页数据
			detail: {},
			// 定义评论页数据
			comments: {}
		}
	}
	// 请求数据，渲染详情页
	showDetail(id) {
		// 请求数据
		this.ajax('data/detail.json?id=' + id, res => {
			// 数据返回成功
			if (res && res.errno === 0) {
				// 更新状态
				this.setState({
					detail: res.data,
					// 打开详情页，隐藏列表页
					section: 'detail'
				})
			}
		})
	}
	// 进入评论页方法，我们要拉取评论页数据
	showComments(id) {
		// 获取新闻id
		// 发送异步请求
		this.ajax('data/comment.json?id=' + id, res => {
			if (res && res.errno === 0) {
				// 更新状态（切换页面）
				this.setState({
					comments: res.data,
					section: 'comments'
				})
			}
		})
	}
	// 点击返回按钮
	goBack() {
		// 1 判断当前页面（通过状态）
		switch (this.state.section) {
			// 2 改变状态，切换页面
			// 评论页面，要进入详情页
			case 'comments':
				this.setState({
					section: 'detail'
				})
				break;
			// 是详情页，返回列表页
			case 'detail':
				this.setState({
					section: 'list'
				})
				break;

		}
	}
	// 渲染组件
	render() {
		// 缓存数据
		let section = this.state.section;
		let content = {__html: '<'};
		return (
			<div>
				<div className="header">
					<div className="go-back" dangerouslySetInnerHTML={content} onClick={this.goBack.bind(this)}></div>
					<div className="login">登录</div>
					<h1>新闻平台</h1>
				</div>
				<div style={{display: section === 'list' ? 'block' : 'none'}}>
					<List method={this.showDetail.bind(this)} data={this.state.list}></List>
				</div>
				<div style={{display: section === 'detail' ? 'block' : 'none'}}>
					{/*将数据传递给详情页组件*/}
					<Detail method={this.showComments.bind(this)} data={this.state.detail}></Detail>
				</div>
				<div style={{display: section === 'comments' ? 'block' : 'none'}}>
					{/*将数据传递给评论页*/}
					<Comments data={this.state.comments}></Comments>
				</div>
			</div>
		)
	}
	// 组件创建完成，拉取数据
	componentDidMount() {
		// console.log(this)
		// 第二种 使用混合的方式
		this.ajax('data/list.json', res => {
			// 请求成功，存储list
			if (res && res.errno === 0) {
				// 更新状态
				this.setState({
					list: res.data
				})
			}
		})
	}
}
// 渲染组件
render(<App color="green" num={100}></App>,  document.getElementById('app'))