import ShoppingList from "./Shopping";
import Showcase from "./Showcase";
// import HelloWorld from './components/HelloWorld';
// import EventHandlers from './lessons/Use-Event-Handlers';
// import ComponentState from './lessons/Use-Component-State';

// const element = (
//   <div><HelloWorld /></div>
// )
// App.prototype.speak = () => {
//   return 'hi there'
// }
// let lilApp = new App()
// console.log(lilApp.speak());
// class App2 extends App {
//   constructor(helloWorld) {
//     super(helloWorld)
//   }
//   speak () {
//     console.log(this.helloWorld)
//   }
// }
// let a2 = new App2('forget about it')
// a2.speak()

// const element = (
//   <div><EventHandlers /></div>
//   <div><HelloWorld /></div>
//   <div><ComponentState /></div>
// )

const list = [
  {
    title: "React",
    url: "https://facebook.github.io/react/",
    author: "Jordan Walke",
    number_comments: 3,
    points: 4,
    id: 0,
  },
  {
    title: "Redux",
    url: "https://github.com/reactjs/redux/",
    author: "Dan Abramov",
    number_comments: 2,
    points: 5,
    id: 1,
  },
];
const [react, redux] = list;

class Developer {
  constructor(firstname, lastname) {
    this.firstname = firstname;
    this.lastname = lastname;
  }

  getName() {
    return `${this.firstname} ${this.lastname}`;
  }
}
const frontendDeveloper = new Developer("David", "Pham");
console.log(frontendDeveloper);
//this.onDismiss = this.onDismiss.bind(this) // bind later when event occurs
// very similar pattern to how angular services to controllers binds to scope
// define business logic outside in a service. Inject and assign to scope in
// controllers. In React, assign in the constructor. Define business logic
// outside the constructor
//this.helloWorld = 'Welcome to the Road to Learn React!'

// functional stateless component: no this object, state/setState, and life cycle
class Search extends Component {
  render() {
    const { value, onChange, children } = this.props;
    return (
      <form action="">
        {children}
        <input type="text" onChange={onChange} value={value} />
      </form>
    );
  }
}
const { value, onChange, children } = props; // props as a parameter
class Table extends Component {
  render() {
    const { list, pattern, onDismiss } = this.props;
    return (
      <div>
        {list.filter(isSearched(pattern)).map((item) => (
          <div key={item.id} className="react-list">
            <a href={item.url} target="_blank">
              {item.title}
            </a>{" "}
            - <span>{item.author}</span>
            <div>Comments: {item.number_comments}</div>
            <div>Points: {item.points}</div>
            {/* <button className="btn btn-danger" onClick={() => onDismiss(item.id)}>
                Dismiss
              </button> */}
            <Button
              className={`btn btn-danger`}
              onClick={() => onDismiss(item.id)}
            >
              Dismiss
            </Button>
          </div>
        ))}
      </div>
    );
  }
}
