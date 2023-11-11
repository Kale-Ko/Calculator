import * as Elements from "./elements";

export default class Solver {
    protected static ORDER_OF_OPERATIONS: string[][] = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name, Elements.ParsedDivide.name, Elements.ParsedModulo.name], [Elements.ParsedPlus.name, Elements.ParsedMinus.name]];

    protected static FUNCTIONS: {
        [propName: string]: Function;
    } = {
            "abs": Solver.wrapMethod(Math.abs, 1), // absolute value
            "sign": Solver.wrapMethod(Math.sign, 1), // sign (1, -1)

            "max": Solver.wrapMethod(Math.max, "any"), // largest number
            "min": Solver.wrapMethod(Math.min, "any"), // smallest number
            "clamp": Solver.wrapMethod((x: number, min: number, max: number): number => {
                return Math.max(Math.min(x, max), min);
            }, 3), // clamp to range
            "floor": Solver.wrapMethod(Math.floor, 1), // round down
            "ceil": Solver.wrapMethod(Math.ceil, 1), // round up
            "round": Solver.wrapMethod(Math.round, 1), // round

            "add": Solver.wrapMethods((x: number, y: number): number => {
                return x + y;
            }, (...args: number[]): number => {
                if (args.length == 0) {
                    return 0;
                }

                let result = args[0]!!;
                for (let i = 1; i < args.length; i++) {
                    result += args[i]!!;
                }
                return result;
            }, 2, "any"), // x + y + ...
            "sub": Solver.wrapMethod((x: number, y: number): number => {
                return x - y;
            }, 2), // x - y
            "mul": Solver.wrapMethods((x: number, y: number): number => {
                return x * y;
            }, (...args: number[]): number => {
                if (args.length == 0) {
                    return 0;
                }

                let result = args[0]!!;
                for (let i = 1; i < args.length; i++) {
                    result *= args[i]!!;
                }
                return result;
            }, 2, "any"), // x * y * ...
            "div": Solver.wrapMethod((x: number, y: number): number => {
                return x / y;
            }, 2), // x / y
            "mod": Solver.wrapMethod((x: number, y: number): number => {
                return x % y;
            }, 2), // x % y

            "pow": Solver.wrapMethod(Math.pow, 2), // x^y
            "exp": Solver.wrapMethod(Math.exp, 1), // E^x
            "expm1": Solver.wrapMethod(Math.exp, 1), // (E^x)-1,

            "sqrt": Solver.wrapMethod(Math.sqrt, 1), // square root
            "cbrt": Solver.wrapMethod(Math.cbrt, 1), // cube root
            "root": Solver.wrapMethod((x: number, y: number): number => {
                var negate = y % 2 == 1 && x < 0;
                if (negate) {
                    x = -x;
                }
                var possible = Math.pow(x, 1 / y);
                return negate ? -possible : possible;
            }, 2), // nth root

            "factorial": Solver.wrapMethod((x: number): number => {
                let result = x;
                for (let y = x - 1; y > 0; y--) {
                    result *= y;
                }
                return result;
            }, 1), // x!

            "sin": Solver.wrapMethod(Math.sin, 1), // sine
            "sinh": Solver.wrapMethod(Math.sinh, 1), // hyperbolic sine
            "asin": Solver.wrapMethod(Math.asin, 1), // inverse sine
            "asinh": Solver.wrapMethod(Math.asinh, 1), // inverse hyperbolic sine

            "cos": Solver.wrapMethod(Math.cos, 1), // cosine
            "cosh": Solver.wrapMethod(Math.cosh, 1), // hyperbolic cosine
            "acos": Solver.wrapMethod(Math.acos, 1), // inverse cosine
            "acosh": Solver.wrapMethod(Math.acosh, 1), // inverse hyperbolic cosine

            "tan": Solver.wrapMethod(Math.tan, 1), // tangent
            "tanh": Solver.wrapMethod(Math.tanh, 1), // hyperbolic tangent
            "atan": Solver.wrapMethod(Math.floor, 1), // inverse tangent
            "atan2": Solver.wrapMethod(Math.floor, 1), // angle between 0,0 and x,y
            "atanh": Solver.wrapMethod(Math.floor, 1), // inverse hyperbolic tangent

            "log": Solver.wrapMethod(Math.log, 1), // natural logarithm
            "log2": Solver.wrapMethod(Math.log2, 1), // base 2 logarithm
            "log10": Solver.wrapMethod(Math.log10, 1), // base 10 logarithm
            "log1p": Solver.wrapMethod(Math.log1p, 1), // log(1+x)

            "random": Solver.wrapMethods(Math.random, (x: number): number => {
                return Math.random() * x;
            }, 0, 1), // random

            "hypot": Solver.wrapMethod(Math.hypot, "any") // square root of the sum of squares of arguments
        };

    protected static wrapMethod(method: Function, argC: number | "any"): Function {
        return (args: number[]): number => {
            if (args.length == argC || argC == "any") {
                return method(...args);
            } else {
                throw new Error("Incorrect number of args");
            }
        }
    }

    protected static wrapMethods(method1: Function, method2: Function, arg1C: number, arg2C: number | "any"): Function {
        return (args: number[]): number => {
            if (args.length == arg1C) {
                return method1(...args);
            } else if (args.length == arg2C || arg2C == "any") {
                return method2(...args);
            } else {
                throw new Error("Incorrect number of args");
            }
        }
    }

    protected tree: Elements.ParsedTree;

    public constructor(tree: Elements.ParsedTree) {
        this.tree = tree;
    }

    public solve(): number {
        if (this.tree.children.length == 0) { // Empty equation
            return 0;
        }

        for (let pointer = 0; pointer < this.tree.children.length; pointer++) { // Parse parenthesis
            if (this.tree.children[pointer] instanceof Elements.ParsedTree) {
                let childTree = this.tree.children[pointer] as Elements.ParsedTree;

                let solver: Solver = new Solver(childTree);
                this.tree.children[pointer] = new Elements.ParsedFloat("()", solver.solve());
            } else if (this.tree.children[pointer] instanceof Elements.ParsedFunction) {
                let childTree = this.tree.children[pointer] as Elements.ParsedFunction;

                for (let pointer = 0; pointer < childTree.args.length; pointer++) { // Parse parenthesis
                    if (childTree.args[pointer] instanceof Elements.ParsedTree) {
                        let subChildTree = childTree.args[pointer] as Elements.ParsedTree;

                        let solver: Solver = new Solver(subChildTree);
                        childTree.args[pointer] = new Elements.ParsedFloat("()", solver.solve());
                    }
                }

                let method = Solver.FUNCTIONS[childTree.name];
                if (method === undefined) {
                    throw new Error("Unknown function '" + childTree.name + "'");
                }

                let args: number[] = [];
                for (let arg of childTree.args) {
                    args.push((arg as Elements.ParsedNumber).number);
                }

                let result = method(args);
                this.tree.children[pointer] = new Elements.ParsedFloat("()", result);
            }
        }

        for (let operations of Solver.ORDER_OF_OPERATIONS) { // Parse equations
            for (let pointer = 0; pointer < this.tree.children.length; pointer++) {
                if (this.tree.children[pointer] instanceof Elements.ParsedOperation) {
                    let n1 = this.tree.children[pointer - 1];
                    let n2 = this.tree.children[pointer + 1];
                    let operation = this.tree.children[pointer] as Elements.ParsedOperation;

                    if (n1 instanceof Elements.ParsedNumber && n2 instanceof Elements.ParsedNumber) {
                        if (operations.includes(operation.constructor.name)) {
                            if (operation instanceof Elements.ParsedPlus) {
                                this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number + n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            } else if (operation instanceof Elements.ParsedMinus) {
                                this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number - n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            } else if (operation instanceof Elements.ParsedTimes) {
                                this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number * n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            } else if (operation instanceof Elements.ParsedDivide) {
                                this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number / n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            } else if (operation instanceof Elements.ParsedExponent) {
                                this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number ** n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            } else if (operation instanceof Elements.ParsedModulo) {
                                this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number % n2.number);
                                this.tree.children.splice(pointer, 2);
                                pointer--;
                            }
                        }
                    } else {
                        throw new Error("Syntax error (Operator must be passed two numbers)");
                    }
                }
            }
        }

        if (this.tree.children.length !== 1) {
            throw new Error("Syntax error (Missing equation)");
        }

        if (this.tree.children[0] instanceof Elements.ParsedNumber) {
            return this.tree.children[0].number;
        } else {
            throw new Error("Syntax error (Missing numbers)");
        }
    }
}