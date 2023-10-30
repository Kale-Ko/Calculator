import * as Elements from "./elements";

export default class Parser {
    protected string: string;
    protected pointer: number;

    public constructor(string: string) {
        this.string = string;
        this.pointer = 0;
    }

    public parse(): Elements.ParsedTree {
        let tree: Elements.ParsedTree = new Elements.ParsedTree([]);

        while (this.hasNext()) {
            let char: string = this.readNext();
            let charCode: number = char.charCodeAt(0);

            if (charCode <= 32) { // Invisible character / space / newline
                continue;
            }

            if (charCode === 40) { // Opening parenthesis
                let parenthesis: string = "";
                let hasClosing = false;
                let childParenthesisCount: number = 0;

                while (this.hasNext()) {
                    let nextChar = this.peekNext();
                    let nextCharCode: number = nextChar.charCodeAt(0);

                    if (nextCharCode !== 41) { // Not closing parenthesis
                        this.consumeNext();

                        parenthesis += nextChar;
                        if (nextCharCode === 40) {
                            childParenthesisCount++;
                        }
                    } else {
                        childParenthesisCount--;
                        this.consumeNext();

                        if (childParenthesisCount < 0) {
                            hasClosing = true;

                            break;
                        } else {
                            parenthesis += nextChar; // For sub-parenthesis
                        }
                    }
                }

                if (!hasClosing) {
                    throw new Error("Syntax error (Missing closing parenthesis)");
                }

                let childParser: Parser = new Parser(parenthesis); // Recursive parsing
                tree.children.push(new Elements.ParsedTree(childParser.parse().children));
            } else if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) { // A-Z a-z
                let name: string = char;
                let doneName = false;
                let argC = 1;
                let args: string[] = [""];
                let hasClosing = false;
                let childParenthesisCount: number = 0;

                while (this.hasNext() && !doneName) {
                    let nextChar = this.peekNext();
                    let nextCharCode: number = nextChar.charCodeAt(0);

                    if ((nextCharCode >= 65 && nextCharCode <= 90) || (nextCharCode >= 97 && nextCharCode <= 122) || (nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) { // Not closing parenthesis
                        this.consumeNext();

                        name += nextChar;
                    } else {
                        this.consumeNext();

                        doneName = true;
                        break;
                    }
                }

                while (this.hasNext()) {
                    let nextChar = this.peekNext();
                    let nextCharCode: number = nextChar.charCodeAt(0);

                    if (nextCharCode === 44) { // Comma
                        this.consumeNext();

                        argC++;
                        args[argC - 1] = "";
                    } else if (nextCharCode !== 41) { // Not closing parenthesis
                        this.consumeNext();

                        args[argC - 1] += nextChar;
                        if (nextCharCode === 40) {
                            childParenthesisCount++;
                        }
                    } else {
                        childParenthesisCount--;
                        this.consumeNext();

                        if (childParenthesisCount < 0) {
                            hasClosing = true;

                            break;
                        } else {
                            args[argC - 1] += nextChar; // For sub-parenthesis
                        }
                    }
                }

                if (!hasClosing) {
                    throw new Error("Syntax error (Missing closing parenthesis)");
                }

                let parsedArgs: Elements.ParsedTree[] = [];

                for (let child of args) {
                    let childParser: Parser = new Parser(child); // Recursive parsing
                    parsedArgs.push(childParser.parse());
                }

                tree.children.push(new Elements.ParsedFunction(name, parsedArgs));
            } else if ((charCode >= 48 && charCode <= 57) || charCode === 46) { // Number, decimal point
                let num: string = char;
                let isFloat: boolean = false;

                while (this.hasNext()) {
                    let nextChar = this.peekNext();
                    let nextCharCode: number = nextChar.charCodeAt(0);

                    if ((nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) { // Number, decimal point
                        this.consumeNext();

                        num += nextChar;
                        if (nextCharCode === 46) {
                            isFloat = true;
                        }
                    } else {
                        break;
                    }
                }

                if (!isFloat) {
                    let parsedNum: number = parseInt(num);
                    tree.children.push(new Elements.ParsedInteger(num, parsedNum));
                } else {
                    let parsedNum: number = parseFloat(num);
                    tree.children.push(new Elements.ParsedFloat(num, parsedNum));
                }
            } else if (charCode === 43) { // Plus
                tree.children.push(new Elements.ParsedPlus(char));
            } else if (charCode === 45) { // Minus
                tree.children.push(new Elements.ParsedMinus(char));
            } else if (charCode === 42) { // Times
                tree.children.push(new Elements.ParsedTimes(char));
            } else if (charCode === 47) { // Divide
                tree.children.push(new Elements.ParsedDivide(char));
            } else if (charCode === 94) { // Exponent
                tree.children.push(new Elements.ParsedExponent(char));
            } else if (charCode === 37) { // Modulo
                tree.children.push(new Elements.ParsedModulo(char));
            } else {
                throw new Error("Invalid/unknown character '" + char + "'" + (charCode === 41 ? " (Mismatched parenthesis)" : ""));
            }
        }

        return tree;
    }

    protected hasNext(): boolean {
        return this.pointer < this.string.length;
    }

    protected readNext(): string {
        this.pointer++;
        return this.string[this.pointer - 1]!!;
    }

    protected peekNext(): string {
        return this.string[this.pointer]!!;
    }

    protected consumeNext(): void {
        this.pointer++;
    }
}