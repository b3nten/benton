import {
  Button,
  UIElement,
  createElement,
  OnChange,
  State,
  UseState,
  type ExtractState,
} from "./ui";
import "./style.css";

let Count = State(0);

setInterval(() => Count.set(Count.get() + 1), 100);

class AppRoot extends UIElement {
  @OnChange(function (count) {
    this.div.innerText = `the count is ${count}`;
  })
  accessor count: number = 0;

  incrementCount = () => this.count++;

  div = Button()
    .setText(`the count is ${this.count}`)
    .setCSS(
      `
        background-color: #282c34;
        &:hover {
          background-color: #61dafb;
        }
      `,
    )
    .on("click", this.incrementCount);

  @UseState(Count, function (val) {
    this.div.innerText = `the count is ${val}`;
  })
  accessor countState!: ExtractState<typeof Count>;

  startup = () => {
    this.appendChild(this.div);
  };
}

document.body.append(createElement(AppRoot));
