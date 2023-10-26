declare namespace Calculator {
    namespace Elements {
        class ParsedElement {
            protected constructor();
        }
        class ParsedToken {
            raw: string;
            protected constructor(raw: string);
        }
        class ParsedNumber extends ParsedToken {
            number: number;
            protected constructor(raw: string, number: number);
        }
        class ParsedInteger extends ParsedNumber {
            constructor(raw: string, number: number);
        }
        class ParsedFloat extends ParsedNumber {
            constructor(raw: string, number: number);
        }
        class ParsedOperation extends ParsedToken {
            protected constructor(raw: string);
        }
        class ParsedPlus extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedMinus extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedTimes extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedDivide extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedExponent extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedModulo extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedTree extends ParsedElement {
            children: ParsedElement[];
            constructor();
        }
    }
    class Parser {
        protected string: string;
        protected pointer: number;
        constructor(string: string);
        parse(): Elements.ParsedTree;
        protected hasNext(): boolean;
        protected readNext(): string;
        protected peekNext(): string;
        protected consumeNext(): void;
    }
    class Solver {
        protected static ORDER_OF_OPERATIONS: string[][];
        protected static ORDER_OF_OPERATIONS_CORRECT: string[][];
        protected tree: Elements.ParsedTree;
        constructor(tree: Elements.ParsedTree);
        solve(): number;
        evaluate(element: Elements.ParsedTree): number;
    }
    class Instance {
        protected rootElement: HTMLDivElement;
        protected inputElement: HTMLInputElement;
        protected outputElement: HTMLSpanElement;
        constructor();
        init(): void;
        calculate(): void;
    }
}
declare let instance: Calculator.Instance;
//# sourceMappingURL=index.d.ts.map