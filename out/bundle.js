/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

// UNUSED EXPORTS: Elements, Instance, Parser, Solver

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
class ParsedInteger extends (/* unused pure expression or super */ null && (ParsedNumber)) {
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

;// CONCATENATED MODULE: ./src/solver.ts

class solver_Solver {
    static ORDER_OF_OPERATIONS = [[ParsedExponent.name], [ParsedTimes.name, ParsedDivide.name, ParsedModulo.name], [ParsedPlus.name, ParsedMinus.name]];
    static FUNCTIONS = {
        "abs": solver_Solver.wrapMethod(Math.abs, 1),
        "sign": solver_Solver.wrapMethod(Math.sign, 1),
        "max": solver_Solver.wrapMethod(Math.max, "any"),
        "min": solver_Solver.wrapMethod(Math.min, "any"),
        "clamp": solver_Solver.wrapMethod((x, min, max) => {
            return Math.max(Math.min(x, max), min);
        }, 3),
        "floor": solver_Solver.wrapMethod(Math.floor, 1),
        "ceil": solver_Solver.wrapMethod(Math.ceil, 1),
        "round": solver_Solver.wrapMethod(Math.round, 1),
        "pow": solver_Solver.wrapMethod(Math.pow, 2),
        "exp": solver_Solver.wrapMethod(Math.exp, 1),
        "expm1": solver_Solver.wrapMethod(Math.exp, 1),
        "sqrt": solver_Solver.wrapMethod(Math.sqrt, 1),
        "cbrt": solver_Solver.wrapMethod(Math.cbrt, 1),
        "sin": solver_Solver.wrapMethod(Math.sin, 1),
        "sinh": solver_Solver.wrapMethod(Math.sinh, 1),
        "asin": solver_Solver.wrapMethod(Math.asin, 1),
        "asinh": solver_Solver.wrapMethod(Math.asinh, 1),
        "cos": solver_Solver.wrapMethod(Math.cos, 1),
        "cosh": solver_Solver.wrapMethod(Math.cosh, 1),
        "acos": solver_Solver.wrapMethod(Math.acos, 1),
        "acosh": solver_Solver.wrapMethod(Math.acosh, 1),
        "tan": solver_Solver.wrapMethod(Math.tan, 1),
        "tanh": solver_Solver.wrapMethod(Math.tanh, 1),
        "atan": solver_Solver.wrapMethod(Math.floor, 1),
        "atan2": solver_Solver.wrapMethod(Math.floor, 1),
        "atanh": solver_Solver.wrapMethod(Math.floor, 1),
        "log": solver_Solver.wrapMethod(Math.log, 1),
        "log2": solver_Solver.wrapMethod(Math.log2, 1),
        "log10": solver_Solver.wrapMethod(Math.log10, 1),
        "log1p": solver_Solver.wrapMethod(Math.log1p, 1),
        "random": solver_Solver.wrapMethods(Math.random, (x) => {
            return Math.random() * x;
        }, 0, 1),
        "hypot": solver_Solver.wrapMethod(Math.hypot, "any") // square root of the sum of squares of arguments
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
                let solver = new solver_Solver(childTree);
                this.tree.children[pointer] = new ParsedFloat("()", solver.solve());
            }
            else if (this.tree.children[pointer] instanceof ParsedFunction) {
                let childTree = this.tree.children[pointer];
                for (let pointer = 0; pointer < childTree.args.length; pointer++) { // Parse parenthesis
                    if (childTree.args[pointer] instanceof ParsedTree) {
                        let subChildTree = childTree.args[pointer];
                        let solver = new solver_Solver(subChildTree);
                        childTree.args[pointer] = new ParsedFloat("()", solver.solve());
                    }
                }
                let method = solver_Solver.FUNCTIONS[childTree.name];
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
        for (let operations of solver_Solver.ORDER_OF_OPERATIONS) { // Parse equations
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


/******/ })()
;
//# sourceMappingURL=bundle.js.map