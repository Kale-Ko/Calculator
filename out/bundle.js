/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/elements.ts
class ParsedElement {
    constructor() { }
}
class ParsedToken {
    raw;
    constructor(raw) {
        this.raw = raw;
    }
}
class ParsedNumber extends ParsedToken {
    number;
    constructor(raw, number) {
        super(raw);
        this.number = number;
    }
}
class ParsedInteger extends ParsedNumber {
    constructor(raw, number) {
        super(raw, number);
    }
}
class ParsedFloat extends ParsedNumber {
    constructor(raw, number) {
        super(raw, number);
    }
}
class ParsedOperation extends ParsedToken {
    constructor(raw) {
        super(raw);
    }
}
class ParsedPlus extends ParsedOperation {
    constructor(raw) {
        super(raw);
    }
}
class ParsedMinus extends ParsedOperation {
    constructor(raw) {
        super(raw);
    }
}
class ParsedTimes extends ParsedOperation {
    constructor(raw) {
        super(raw);
    }
}
class ParsedDivide extends ParsedOperation {
    constructor(raw) {
        super(raw);
    }
}
class ParsedExponent extends ParsedOperation {
    constructor(raw) {
        super(raw);
    }
}
class ParsedModulo extends ParsedOperation {
    constructor(raw) {
        super(raw);
    }
}
class ParsedTree extends ParsedElement {
    children;
    constructor(children) {
        super();
        this.children = children;
    }
}
class ParsedFunction extends ParsedElement {
    name;
    args;
    constructor(name, args) {
        super();
        this.name = name;
        this.args = args;
    }
}

;// CONCATENATED MODULE: ./src/parser.ts

class Parser {
    string;
    pointer;
    constructor(string) {
        this.string = string;
        this.pointer = 0;
    }
    parse() {
        let tree = new ParsedTree([]);
        while (this.hasNext()) {
            let char = this.readNext();
            let charCode = char.charCodeAt(0);
            if (charCode <= 32) { // Invisible character / space / newline
                continue;
            }
            if (charCode === 40) { // Opening parenthesis
                let parenthesis = "";
                let hasClosing = false;
                let childParenthesisCount = 0;
                while (this.hasNext()) {
                    let nextChar = this.peekNext();
                    let nextCharCode = nextChar.charCodeAt(0);
                    if (nextCharCode !== 41) { // Not closing parenthesis
                        this.consumeNext();
                        parenthesis += nextChar;
                        if (nextCharCode === 40) {
                            childParenthesisCount++;
                        }
                    }
                    else {
                        childParenthesisCount--;
                        this.consumeNext();
                        if (childParenthesisCount < 0) {
                            hasClosing = true;
                            break;
                        }
                        else {
                            parenthesis += nextChar; // For sub-parenthesis
                        }
                    }
                }
                if (!hasClosing) {
                    throw new Error("Syntax error (Missing closing parenthesis)");
                }
                let childParser = new Parser(parenthesis); // Recursive parsing
                tree.children.push(new ParsedTree(childParser.parse().children));
            }
            else if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) { // A-Z a-z
                let name = char;
                let doneName = false;
                let argC = 1;
                let args = [""];
                let hasClosing = false;
                let childParenthesisCount = 0;
                while (this.hasNext() && !doneName) {
                    let nextChar = this.peekNext();
                    let nextCharCode = nextChar.charCodeAt(0);
                    if ((nextCharCode >= 65 && nextCharCode <= 90) || (nextCharCode >= 97 && nextCharCode <= 122) || (nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) { // Not closing parenthesis
                        this.consumeNext();
                        name += nextChar;
                    }
                    else {
                        this.consumeNext();
                        doneName = true;
                        break;
                    }
                }
                while (this.hasNext()) {
                    let nextChar = this.peekNext();
                    let nextCharCode = nextChar.charCodeAt(0);
                    if (nextCharCode === 44) { // Comma
                        this.consumeNext();
                        argC++;
                        args[argC - 1] = "";
                    }
                    else if (nextCharCode !== 41) { // Not closing parenthesis
                        this.consumeNext();
                        args[argC - 1] += nextChar;
                        if (nextCharCode === 40) {
                            childParenthesisCount++;
                        }
                    }
                    else {
                        childParenthesisCount--;
                        this.consumeNext();
                        if (childParenthesisCount < 0) {
                            hasClosing = true;
                            break;
                        }
                        else {
                            args[argC - 1] += nextChar; // For sub-parenthesis
                        }
                    }
                }
                if (!hasClosing) {
                    throw new Error("Syntax error (Missing closing parenthesis)");
                }
                let parsedArgs = [];
                for (let child of args) {
                    let childParser = new Parser(child); // Recursive parsing
                    parsedArgs.push(childParser.parse());
                }
                tree.children.push(new ParsedFunction(name, parsedArgs));
            }
            else if ((charCode >= 48 && charCode <= 57) || charCode === 46) { // Number, decimal point
                let num = char;
                let isFloat = false;
                while (this.hasNext()) {
                    let nextChar = this.peekNext();
                    let nextCharCode = nextChar.charCodeAt(0);
                    if ((nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) { // Number, decimal point
                        this.consumeNext();
                        num += nextChar;
                        if (nextCharCode === 46) {
                            isFloat = true;
                        }
                    }
                    else {
                        break;
                    }
                }
                if (!isFloat) {
                    let parsedNum = parseInt(num);
                    tree.children.push(new ParsedInteger(num, parsedNum));
                }
                else {
                    let parsedNum = parseFloat(num);
                    tree.children.push(new ParsedFloat(num, parsedNum));
                }
            }
            else if (charCode === 43) { // Plus
                tree.children.push(new ParsedPlus(char));
            }
            else if (charCode === 45) { // Minus
                tree.children.push(new ParsedMinus(char));
            }
            else if (charCode === 42) { // Times
                tree.children.push(new ParsedTimes(char));
            }
            else if (charCode === 47) { // Divide
                tree.children.push(new ParsedDivide(char));
            }
            else if (charCode === 94) { // Exponent
                tree.children.push(new ParsedExponent(char));
            }
            else if (charCode === 37) { // Modulo
                tree.children.push(new ParsedModulo(char));
            }
            else {
                throw new Error("Invalid/unknown character '" + char + "'" + (charCode === 41 ? " (Mismatched parenthesis)" : ""));
            }
        }
        return tree;
    }
    hasNext() {
        return this.pointer < this.string.length;
    }
    readNext() {
        this.pointer++;
        return this.string[this.pointer - 1];
    }
    peekNext() {
        return this.string[this.pointer];
    }
    consumeNext() {
        this.pointer++;
    }
}

;// CONCATENATED MODULE: ./src/solver.ts

class Solver {
    static ORDER_OF_OPERATIONS = [[ParsedExponent.name], [ParsedTimes.name, ParsedDivide.name, ParsedModulo.name], [ParsedPlus.name, ParsedMinus.name]];
    static FUNCTIONS = {
        "abs": Solver.wrapMethod(Math.abs, 1),
        "sign": Solver.wrapMethod(Math.sign, 1),
        "max": Solver.wrapMethod(Math.max, "any"),
        "min": Solver.wrapMethod(Math.min, "any"),
        "clamp": Solver.wrapMethod((x, min, max) => {
            return Math.max(Math.min(x, max), min);
        }, 3),
        "floor": Solver.wrapMethod(Math.floor, 1),
        "ceil": Solver.wrapMethod(Math.ceil, 1),
        "round": Solver.wrapMethod(Math.round, 1),
        "add": Solver.wrapMethods((x, y) => {
            return x + y;
        }, (...args) => {
            if (args.length == 0) {
                return 0;
            }
            let result = args[0];
            for (let i = 1; i < args.length; i++) {
                result += args[i];
            }
            return result;
        }, 2, "any"),
        "sub": Solver.wrapMethod((x, y) => {
            return x - y;
        }, 2),
        "mul": Solver.wrapMethods((x, y) => {
            return x * y;
        }, (...args) => {
            if (args.length == 0) {
                return 0;
            }
            let result = args[0];
            for (let i = 1; i < args.length; i++) {
                result *= args[i];
            }
            return result;
        }, 2, "any"),
        "div": Solver.wrapMethod((x, y) => {
            return x / y;
        }, 2),
        "mod": Solver.wrapMethod((x, y) => {
            return x % y;
        }, 2),
        "pow": Solver.wrapMethod(Math.pow, 2),
        "exp": Solver.wrapMethod(Math.exp, 1),
        "expm1": Solver.wrapMethod(Math.exp, 1),
        "sqrt": Solver.wrapMethod(Math.sqrt, 1),
        "cbrt": Solver.wrapMethod(Math.cbrt, 1),
        "root": Solver.wrapMethod((x, y) => {
            var negate = y % 2 == 1 && x < 0;
            if (negate) {
                x = -x;
            }
            var possible = Math.pow(x, 1 / y);
            return negate ? -possible : possible;
        }, 2),
        "factorial": Solver.wrapMethod((x) => {
            let result = x;
            for (let y = x - 1; y > 0; y--) {
                result *= y;
            }
            return result;
        }, 1),
        "sin": Solver.wrapMethod(Math.sin, 1),
        "sinh": Solver.wrapMethod(Math.sinh, 1),
        "asin": Solver.wrapMethod(Math.asin, 1),
        "asinh": Solver.wrapMethod(Math.asinh, 1),
        "cos": Solver.wrapMethod(Math.cos, 1),
        "cosh": Solver.wrapMethod(Math.cosh, 1),
        "acos": Solver.wrapMethod(Math.acos, 1),
        "acosh": Solver.wrapMethod(Math.acosh, 1),
        "tan": Solver.wrapMethod(Math.tan, 1),
        "tanh": Solver.wrapMethod(Math.tanh, 1),
        "atan": Solver.wrapMethod(Math.floor, 1),
        "atan2": Solver.wrapMethod(Math.floor, 1),
        "atanh": Solver.wrapMethod(Math.floor, 1),
        "log": Solver.wrapMethod(Math.log, 1),
        "log2": Solver.wrapMethod(Math.log2, 1),
        "log10": Solver.wrapMethod(Math.log10, 1),
        "log1p": Solver.wrapMethod(Math.log1p, 1),
        "random": Solver.wrapMethods(Math.random, (x) => {
            return Math.random() * x;
        }, 0, 1),
        "hypot": Solver.wrapMethod(Math.hypot, "any") // square root of the sum of squares of arguments
    };
    static wrapMethod(method, argC) {
        return (args) => {
            if (args.length == argC || argC == "any") {
                return method(...args);
            }
            else {
                throw new Error("Incorrect number of args");
            }
        };
    }
    static wrapMethods(method1, method2, arg1C, arg2C) {
        return (args) => {
            if (args.length == arg1C) {
                return method1(...args);
            }
            else if (args.length == arg2C || arg2C == "any") {
                return method2(...args);
            }
            else {
                throw new Error("Incorrect number of args");
            }
        };
    }
    tree;
    constructor(tree) {
        this.tree = tree;
    }
    solve() {
        if (this.tree.children.length == 0) { // Empty equation
            return 0;
        }
        for (let pointer = 0; pointer < this.tree.children.length; pointer++) { // Parse parenthesis
            if (this.tree.children[pointer] instanceof ParsedTree) {
                let childTree = this.tree.children[pointer];
                let solver = new Solver(childTree);
                this.tree.children[pointer] = new ParsedFloat("()", solver.solve());
            }
            else if (this.tree.children[pointer] instanceof ParsedFunction) {
                let childTree = this.tree.children[pointer];
                for (let pointer = 0; pointer < childTree.args.length; pointer++) { // Parse parenthesis
                    if (childTree.args[pointer] instanceof ParsedTree) {
                        let subChildTree = childTree.args[pointer];
                        let solver = new Solver(subChildTree);
                        childTree.args[pointer] = new ParsedFloat("()", solver.solve());
                    }
                }
                let method = Solver.FUNCTIONS[childTree.name];
                if (method === undefined) {
                    throw new Error("Unknown function '" + childTree.name + "'");
                }
                let args = [];
                for (let arg of childTree.args) {
                    args.push(arg.number);
                }
                let result = method(args);
                this.tree.children[pointer] = new ParsedFloat("()", result);
            }
        }
        for (let operations of Solver.ORDER_OF_OPERATIONS) { // Parse equations
            for (let pointer = 0; pointer < this.tree.children.length; pointer++) {
                if (this.tree.children[pointer] instanceof ParsedOperation) {
                    let n1 = this.tree.children[pointer - 1];
                    let n2 = this.tree.children[pointer + 1];
                    let operation = this.tree.children[pointer];
                    if (n1 instanceof ParsedNumber && n2 instanceof ParsedNumber) {
                        if (operations.includes(operation.constructor.name)) {
                            if (operation instanceof ParsedPlus) {
                                this.tree.children[pointer - 1] = new ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number + n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            }
                            else if (operation instanceof ParsedMinus) {
                                this.tree.children[pointer - 1] = new ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number - n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            }
                            else if (operation instanceof ParsedTimes) {
                                this.tree.children[pointer - 1] = new ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number * n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            }
                            else if (operation instanceof ParsedDivide) {
                                this.tree.children[pointer - 1] = new ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number / n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            }
                            else if (operation instanceof ParsedExponent) {
                                this.tree.children[pointer - 1] = new ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number ** n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            }
                            else if (operation instanceof ParsedModulo) {
                                this.tree.children[pointer - 1] = new ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number % n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            }
                        }
                    }
                    else {
                        throw new Error("Syntax error (Operator must be passed two numbers)");
                    }
                }
            }
        }
        if (this.tree.children.length !== 1) {
            throw new Error("Syntax error (Missing equation)");
        }
        if (this.tree.children[0] instanceof ParsedNumber) {
            return this.tree.children[0].number;
        }
        else {
            throw new Error("Syntax error (Missing numbers)");
        }
    }
}

;// CONCATENATED MODULE: ./src/index.ts


class Instance {
    rootElement;
    inputElement;
    outputElement;
    constructor() {
        this.rootElement = document.querySelector("#calculator");
        this.inputElement = this.rootElement.querySelector(".calculator_input");
        this.outputElement = this.rootElement.querySelector(".calculator_output");
    }
    init() {
        this.inputElement.addEventListener("keydown", (event) => {
            let key = event.key.toLowerCase();
            if (key === "enter") {
                this.calculate();
            }
        });
        this.calculate();
    }
    calculate() {
        try {
            console.log("Input", this.inputElement.value);
            let parser = new Parser(this.inputElement.value);
            let tree = parser.parse();
            console.log("Parsed", JSON.stringify(tree, null, 2));
            let solver = new Solver(tree);
            let result = solver.solve();
            console.log("Solved", result.toString());
            this.outputElement.innerText = result.toString();
        }
        catch (e) {
            this.outputElement.innerText = "ERR";
            console.warn(e);
        }
    }
}
let instance = new Instance();
instance.init();

/******/ })()
;
//# sourceMappingURL=bundle.js.map