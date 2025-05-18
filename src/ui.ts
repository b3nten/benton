//   ███▄ ▄███▓ ▒█████  ▓█████▄  █    ██  ██▓    ▓█████     █    ██  ██▓
//  ▓██▒▀█▀ ██▒▒██▒  ██▒▒██▀ ██▌ ██  ▓██▒▓██▒    ▓█   ▀     ██  ▓██▒▓██▒
//  ▓██    ▓██░▒██░  ██▒░██   █▌▓██  ▒██░▒██░    ▒███      ▓██  ▒██░▒██▒
//  ▒██    ▒██ ▒██   ██░░▓█▄   ▌▓▓█  ░██░▒██░    ▒▓█  ▄    ▓▓█  ░██░░██░
//  ▒██▒   ░██▒░ ████▓▒░░▒████▓ ▒▒█████▓ ░██████▒░▒████▒   ▒▒█████▓ ░██░
//  ░ ▒░   ░  ░░ ▒░▒░▒░  ▒▒▓  ▒ ░▒▓▒ ▒ ▒ ░ ▒░▓  ░░░ ▒░ ░   ░▒▓▒ ▒ ▒ ░▓
//  ░  ░      ░  ░ ▒ ▒░  ░ ▒  ▒ ░░▒░ ░ ░ ░ ░ ▒  ░ ░ ░  ░   ░░▒░ ░ ░  ▒ ░
//  ░      ░   ░ ░ ░ ▒   ░ ░  ░  ░░░ ░ ░   ░ ░      ░       ░░░ ░ ░  ▒ ░
//         ░       ░ ░     ░       ░         ░  ░   ░  ░      ░      ░
//                       ░
// Author: Benton Boychuk-Chorney
// Date: May 18, 2025
// A simple UI library designed around Vanilla JS

//     ▄▄▄▄▄      ▄▄▄▄▀ ██     ▄▄▄▄▀ ▄███▄
//    █     ▀▄ ▀▀▀ █    █ █ ▀▀▀ █    █▀   ▀
//  ▄  ▀▀▀▀▄       █    █▄▄█    █    ██▄▄
//   ▀▄▄▄▄▀       █     █  █   █     █▄   ▄▀
//               ▀         █  ▀      ▀███▀
//                        █
//                       ▀

export class StateObject<T> {
  constructor(private _value: T) {}

  get = () => this._value;

  set = (newValue: T) => {
    this._value = newValue;
    for (let sub of this._subs) {
      let subRef = sub.deref();
      if (subRef) {
        subRef(newValue);
      } else {
        this._subs.delete(sub);
      }
    }
  };

  subscribe = (sub: (val: T) => void) => {
    let ref = new WeakRef(sub);
    this._subs.add(ref);
    return () => void this._subs.delete(ref);
  };

  // using weakref so no requirement to unsubscribe to prevent memory leaks
  // although possible manually too
  private _subs = new Set<WeakRef<(val: T) => void>>();
}

// Get the underlying value type of the state object
export type ExtractState<T> = T extends StateObject<infer U> ? U : never;

export let State = <T>(value: T): StateObject<T> => new StateObject(value);

//   ▄  █    ▄▄▄▄▀ █▀▄▀█ █         ▄███▄      ▄     ▄▄▄▄▀ ▄███▄      ▄      ▄▄▄▄▄   ▄█ ████▄    ▄      ▄▄▄▄▄
//  █   █ ▀▀▀ █    █ █ █ █         █▀   ▀ ▀▄   █ ▀▀▀ █    █▀   ▀      █    █     ▀▄ ██ █   █     █    █     ▀▄
//  ██▀▀█     █    █ ▄ █ █         ██▄▄     █ ▀      █    ██▄▄    ██   █ ▄  ▀▀▀▀▄   ██ █   █ ██   █ ▄  ▀▀▀▀▄
//  █   █    █     █   █ ███▄      █▄   ▄▀ ▄ █      █     █▄   ▄▀ █ █  █  ▀▄▄▄▄▀    ▐█ ▀████ █ █  █  ▀▄▄▄▄▀
//     █    ▀         █      ▀     ▀███▀  █   ▀▄   ▀      ▀███▀   █  █ █             ▐       █  █ █
//    ▀              ▀                     ▀                      █   ██                     █   ██
//
// A set of convienience functions (mostly making some chainable) for eaiser construction
// of HTMLElements manually
// eg: let div = Div().setProperty("foo", bar).on("hover", console.log)                                                                                                                                                ▐▌

declare global {
  interface HTMLElement {
    css: string;
    on<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): this;

    setProperty: <T extends keyof this>(name: T, value: this[T]) => this;
    setAttribute: (name: string, value: string) => this;
    setCSS: (styles: string) => this;
    setText: (text: string) => this;
    setInnerHTML: (html: string) => this;
    removeAttribute: (name: string) => this;
  }
}

// we hash our css strings to a number which lets us
// create an emoji string as class names
// should be fast enough even with thousands of elements
let cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

let styles = new Map<string, string>();

// document-level CSSStyleSheet for our styles
let sheet = new CSSStyleSheet();

document.adoptedStyleSheets.push(sheet);

// emojis map to digits in the hash
let emoji = ["🐈‍⬛", "🍁", "🐙", "🍉", "🐸", "🗿", "🐷", "🌧️", "🫡", "🍺"];

let toEmoji = (str: string) => {
  let hash = String(cyrb53(str));
  let result = "";
  for (let i = 0; i < hash.length; i++) {
    let index = parseInt(hash[i]);
    result += emoji[index];
  }
  return result;
};

// define css property on HTMLElement
Object.defineProperty(HTMLElement.prototype, "css", {
  get() {
    return this._css;
  },
  set(v: string) {
    // remove old css class
    if (!v) {
      if (this._cssid) {
        this.classList.remove(this._cssid);
        this._cssid = undefined;
      }
      return;
    }
    if (styles.has(v)) {
      // get from cache
      this.classList.add(styles.get(v)!);
    } else {
      // gen id and add to cache + element + stylesheet
      let id = toEmoji(v);
      sheet.insertRule(`.${id} { ${v} }`);
      styles.set(v, id);
      this.classList.add(id);
      this._cssid = id;
    }
  },
});

// event listener convienience function
const originalAddEventListener = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.on = function (type, listener, options) {
  originalAddEventListener.call(this, type, listener as any, options);
  return this;
};

// set arbitrary property on HTMLElement
HTMLElement.prototype.setProperty = function (name, value) {
  this[name] = value;
  return this;
};

let originalSetAttribute = HTMLElement.prototype.setAttribute;
HTMLElement.prototype.setAttribute = function (name, value) {
  originalSetAttribute.call(this, name, value);
  return this;
};

let originalRemoveAttribute = HTMLElement.prototype.removeAttribute;
HTMLElement.prototype.removeAttribute = function (name) {
  originalRemoveAttribute.call(this, name);
  return this;
};

// chainable css setter
HTMLElement.prototype.setCSS = function (styles) {
  this.css = styles;
  return this;
};

HTMLElement.prototype.setText = function (text) {
  this.innerText = text;
  return this;
};

HTMLElement.prototype.setInnerHTML = function (html) {
  this.innerHTML = html;
  return this;
};

//    ▄   ▄█ ▄███▄   █     ▄███▄   █▀▄▀█ ▄███▄      ▄     ▄▄▄▄▀
//     █  ██ █▀   ▀  █     █▀   ▀  █ █ █ █▀   ▀      █ ▀▀▀ █
//  █   █ ██ ██▄▄    █     ██▄▄    █ ▄ █ ██▄▄    ██   █    █
//  █   █ ▐█ █▄   ▄▀ ███▄  █▄   ▄▀ █   █ █▄   ▄▀ █ █  █   █
//  █▄ ▄█  ▐ ▀███▀       ▀ ▀███▀      █  ▀███▀   █  █ █  ▀
//   ▀▀▀                             ▀           █   ██
//

// not exactly sure why i need this, something related to decorators and the codegen
// @ts-ignore
Symbol.metadata ??= Symbol("metadata");

// stores the observed attributes for each class, is populated
// before observedAttributes is accessed
let observed_attrs = new Map<DecoratorMetadataObject, Set<string | symbol>>();

let default_attr_converter = (val: any) => val;

//
// Attribute decorator
//

export function Attribute<T>(
  options: {
    overriddenName?: string;
    converter?: (s: string) => any;
    reflect?: boolean;
  } = {},
) {
  return function <This extends UIElement>(
    _: ClassAccessorDecoratorTarget<This, T>,
    {
      kind,
      name,
      metadata,
      addInitializer,
    }: ClassAccessorDecoratorContext<This, T>,
  ) {
    if (kind !== "accessor") {
      throw new Error(
        "Invalid decorator usage: @attribute only works on class accessors.",
      );
    }
    let attrName = options.overriddenName ?? name;
    let converter = options.converter ?? default_attr_converter;
    if (!observed_attrs.has(metadata!))
      observed_attrs.set(metadata!, new Set());
    observed_attrs.get(metadata!)!.add(attrName);
    addInitializer(function (this: This) {
      let config = this._attrMap.get(attrName);
      if (!config) {
        config = [];
      }
      config.push({
        property: name,
        converter,
      });
      this._attrMap.set(attrName, config);
    });
  };
}

//
// OnChange decorator - watches for state changes and calls the callback
//

export function OnChange<T, This extends UIElement>(
  callback: (this: This, newValue: T, oldValue: T) => void,
) {
  return function (
    _: ClassAccessorDecoratorTarget<This, T>,
  ): ClassAccessorDecoratorResult<This, T> {
    let val: T;
    return {
      get() {
        return val;
      },
      set(newValue: T) {
        let oldValue = val;
        val = newValue;
        this.started && callback.call(this, newValue, oldValue);
      },
      init(value: T) {
        return (val = value);
      },
    };
  };
}

//
// UseState decorator - binds a StateObject to a class property
//

export function UseState<T, This extends UIElement>(
  state: ReturnType<typeof State<T>>,
  callback: (this: This, newValue: T, oldValue: T) => void,
) {
  return function (
    _: ClassAccessorDecoratorTarget<This, T>,
    { name }: ClassAccessorDecoratorContext<This, T>,
  ): ClassAccessorDecoratorResult<This, T> {
    return {
      get() {
        return state.get();
      },
      set(newValue: T) {
        let oldValue = state.get();
        state.set(newValue);
        this.started && callback.call(this, newValue, oldValue);
      },
      init(initVal: T) {
        if (initVal) {
          throw TypeError(`Initial value is not allowed for UseState.`);
        }
        let key = String(name) + "_on_change_" + crypto.randomUUID();
        // @ts-ignore
        this[key] = (val: T) => {
          let oldValue = state.get();
          this.started && callback.call(this, val, oldValue);
        };
        // @ts-ignore
        state.subscribe(this[key]);
        return state.get();
      },
    };
  };
}

//
// UIElement custom element base class
//

export class UIElement extends HTMLElement {
  static Name: string;

  static get observedAttributes() {
    // @ts-ignore
    return Array.from(observed_attrs.get(this[Symbol.metadata]) ?? []);
  }

  started: boolean = false;

  startup?: () => void;

  shutdown?: () => void;

  remount?: () => void;

  connectedCallback() {
    this.started = true;
    this.startup?.();
  }

  disconnectedCallback() {
    this.shutdown?.();
    this.started = false;
  }

  adoptedCallback() {
    this.remount?.();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;
    let props = this._attrMap.get(name);
    if (props) {
      for (let prop of props) {
        let converter = prop.converter;
        let value = converter(newValue!);
        // @ts-ignore
        this[prop.property] = value;
      }
    }
  }

  _attrMap = new Map<
    string | symbol,
    Array<{
      property: string | symbol;
      converter: (s: string) => any;
    }>
  >();
}

type Constructor<T, Args extends any[] = any[]> = new (...args: Args) => T;

export type InstanceOf<T> = T extends Constructor<infer U> ? U : never;

let isHTMLTag = (str: any): str is keyof HTMLElementTagNameMap => {
  return typeof str === "string";
};

let isCustomElement = (str: any): str is Constructor<UIElement> => {
  return typeof str === "function";
};

export function createElement<T extends keyof HTMLElementTagNameMap>(
  tag: T,
): HTMLElementTagNameMap[T];
export function createElement<T extends Constructor<UIElement>>(
  element: T,
): InstanceOf<T>;
export function createElement<T>(element: T) {
  if (isHTMLTag(element)) {
    let tag = element as keyof HTMLElementTagNameMap;
    return document.createElement(tag);
  }
  if (isCustomElement(element)) {
    if (!(element as Constructor<UIElement>).Name) {
      element.Name = `${element.name.toLowerCase()}-${crypto.randomUUID()}`;
    }
    if (!customElements.get(element.Name)) {
      customElements.define(element.Name, element);
    }
    return document.createElement(element.Name);
  }
  throw TypeError(
    `Invalid element type: ${element}. Must be a string or a constructor.`,
  );
}

//     ▄▄▄▄▀ ██     ▄▀    ▄▄▄▄▄
//  ▀▀▀ █    █ █  ▄▀     █     ▀▄
//      █    █▄▄█ █ ▀▄ ▄  ▀▀▀▀▄
//     █     █  █ █   █ ▀▄▄▄▄▀
//    ▀         █  ███
//             █
//            ▀

let createTagFunction = <T extends keyof HTMLElementTagNameMap>(
  tag: T,
): (() => HTMLElementTagNameMap[T]) => {
  return (selectors?: string) => {
    let el = document.createElement(tag);
    if (selectors) {
      // split a selector list by "."
      // eg: "myclass" => ["myclass"]
      // eg: "#id" => ["#id"]
      // eg: "some.classes.here" => ["some", "classes", "here"]
      // eg: "#id.with.classes" => ["#id","with", "classes"]
      let selectorList = selectors.split(".");
      for (let selector of selectorList) {
        if (selector.startsWith("#")) {
          el.setAttribute("id", selector.slice(1));
        } else {
          el.classList.add(selector.slice(1));
        }
      }
    }
    return el;
  };
};

export let Div = createTagFunction("div");
export let Span = createTagFunction("span");
export let P = createTagFunction("p");
export let H1 = createTagFunction("h1");
export let H2 = createTagFunction("h2");
export let H3 = createTagFunction("h3");
export let H4 = createTagFunction("h4");
export let H5 = createTagFunction("h5");
export let H6 = createTagFunction("h6");
export let A = createTagFunction("a");
export let Img = createTagFunction("img");
export let Button = createTagFunction("button");
export let Input = createTagFunction("input");
export let TextArea = createTagFunction("textarea");
export let Select = createTagFunction("select");
export let Option = createTagFunction("option");
export let Form = createTagFunction("form");
export let Label = createTagFunction("label");
export let Table = createTagFunction("table");
export let Thead = createTagFunction("thead");
export let Tbody = createTagFunction("tbody");
export let Tfoot = createTagFunction("tfoot");
export let Tr = createTagFunction("tr");
export let Td = createTagFunction("td");
export let Th = createTagFunction("th");
export let Ul = createTagFunction("ul");
export let Ol = createTagFunction("ol");
export let Li = createTagFunction("li");
export let Nav = createTagFunction("nav");
export let Header = createTagFunction("header");
export let Footer = createTagFunction("footer");
export let Main = createTagFunction("main");
export let Section = createTagFunction("section");
export let Article = createTagFunction("article");
export let Aside = createTagFunction("aside");
export let Address = createTagFunction("address");
export let Blockquote = createTagFunction("blockquote");
export let Pre = createTagFunction("pre");
export let Code = createTagFunction("code");
export let Kbd = createTagFunction("kbd");
export let S = createTagFunction("s");
export let Strong = createTagFunction("strong");
export let Em = createTagFunction("em");
export let Small = createTagFunction("small");
export let Mark = createTagFunction("mark");
export let Del = createTagFunction("del");
export let Ins = createTagFunction("ins");
export let B = createTagFunction("b");
export let I = createTagFunction("i");
export let U = createTagFunction("u");
export let Q = createTagFunction("q");
export let Cite = createTagFunction("cite");
