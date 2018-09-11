// =========================================================
//      Operations handlers
// =========================================================

var operationsUnary = { operators: {} };

operationsUnary.addOperator = function(name, func) {
    this.operators[name] = func;
};

operationsUnary.summonOperator = function(name, value) {
    var main;
    try {
        if(this.operators[name] === undefined) throw new Error("Operator wasn't found");
        
        if (isNaN(+value) || (+value) == Infinity)
            throw new Error("One of operands is not a number");
        
        main = (this.operators[name])( +value );
        logOperation(main, `${name} ${value} =`, main);
        updateDisplays(main);
    } catch (e) {
        main = +value;
        logOperation(main, `[E]: ${e} :: ${name} ${value} =`);
        updateDisplays(main, undefined, "[E]: "+e);
    }
};

var operationsBinary = { operators: {}, buffer: [] };

operationsBinary.addOperator = function(name, func) {
    this.operators[name] = func;
    this.buffer[name] = [];
};

operationsBinary.summonOperator = function(name, value, serviceMarker) {
    var main, buffer;
    if (serviceMarker === undefined) serviceMarker = false;
    try {
        if(this.operators[name] === undefined) throw new Error("Operator wasn't found");
        this.buffer.push(+value);
        if(this.buffer.length == 2) {
            var operation;
            if (createCalculator.operationBuffer != name)
                operation = createCalculator.operationBuffer;
            else 
                operation = name;
            
            buffer = `${this.buffer[0]} ${operation} ${this.buffer[1]} =`; 
            
            if (isNaN(this.buffer[0]) || this.buffer[0] == Infinity || isNaN(this.buffer[1]) || this.buffer[1] == Infinity)
                throw new Error("One of operands is not a number");
            
            main = (this.operators[operation])( this.buffer[0], this.buffer[1] );
            
            this.buffer = [];
            if (!serviceMarker) {
                createCalculator.operationBuffer = name;
                this.buffer.push(main);
                
                logOperation(main, buffer, main);
                updateDisplays("", `${buffer} ${main}`);
            } else {
                createCalculator.operationBuffer = undefined;
                logOperation(main, buffer, main);
                updateDisplays(main, buffer);
            }
        } else {
            buffer = this.buffer[0] + " " + name;
            updateDisplays("", buffer);
            createCalculator.operationBuffer = name;
        }
    } catch (e) {
        main = 0;
        logOperation(main, `[E]: ${e} :: ${buffer}`);
        updateDisplays(main, buffer, "[E]: "+e);
        this.buffer = [];
    }
};

var serviceOperators = { operators: {} };

serviceOperators.addOperator = function(name, func) {
    this.operators[name] = func;
};

serviceOperators.summonOperator = function(name) {
    (this.operators[name])();
};

// =========================================================
//      Operations descriptors
// =========================================================

function prepareCalc() {
    // Binary Operators
    operationsBinary.addOperator("+", function(a,b) { return a+b; } );
    operationsBinary.addOperator("-", function(a,b) { return a-b; } );
    operationsBinary.addOperator("*", function(a,b) { return a*b; } );
    operationsBinary.addOperator("/", function(a,b) { 
        if (b == 0) throw new Error("Division by 0");
        return a/b;
    });
    operationsBinary.addOperator("mod", function(a,b) { 
        if (b == 0) throw new Error("Division by 0");
        return a % b;
    });
    operationsBinary.addOperator("div", function(a,b) { 
        if (b == 0) throw new Error("Division by 0");
        return Math.trunc(a / b);
    });
    operationsBinary.addOperator("^", function(a,b) { return Math.pow(a,b); });
    operationsBinary.addOperator("a^(1/b)", function(a,b) { 
        if (b == 0) throw new Error("Division by 0");
        return Math.pow(a, 1/b);
    });
    operationsBinary.addOperator("log", function(a,b) { 
        if (a == 0) throw new Error("Can't get logarithm from 0");
        if (a < 0) throw new Error("Can't get logarithm from negative number");
        if (b == 1) throw new Error("Logarithm foundation can't be equal to 1");
        if (b < 1) throw new Error("Logarithm foundation can't be negative");
        if (b == 0) throw new Error("Logarithm foundation can't be equal to 0");
        return Math.log(a)/Math.log(b);
    });
    
    // Unary Operators
    operationsUnary.addOperator("exp", function(a) { return Math.exp(a); } );
    operationsUnary.addOperator("ln", function(a,b) { 
        if (a == 0) throw new Error("Can't get logarithm from 0");
        if (a < 0) throw new Error("Can't get logarithm from negative number");
        return Math.log(a);
    });
    operationsUnary.addOperator("√a", function(a) { return Math.sqrt(a); } );
    operationsUnary.addOperator("a²", function(a) { return a*a; } );
    
    operationsUnary.addOperator("!", function(a) { return factorial(Math.trunc(a)); } );
    operationsUnary.addOperator("abs", function(a) { return Math.abs(a); } );
    operationsUnary.addOperator("++", function(a) { return a+1; } );
    operationsUnary.addOperator("--", function(a) { return a-1; } );
    
    operationsUnary.addOperator("sin", function(a) { return Math.sin(a); } );
    operationsUnary.addOperator("cos", function(a) { return Math.cos(a); } );
    operationsUnary.addOperator("tg", function(a) { 
        if (Math.abs(a % Math.PI) == Math.abs(Math.PI / 2) )  throw new Error("Can't get tangent from pi/2");
        return Math.tan(a);
    } );
    operationsUnary.addOperator("ctg", function(a) { 
        if (Math.abs(a % Math.PI) == 0 )  throw new Error("Can't get ctangent from pi");
        return 1/Math.tan(a);
    } );
    operationsUnary.addOperator("trunc", function(a) { return Math.trunc(a); } );
    
    // Service Operators
    serviceOperators.addOperator("=", function() {
        var value = +(document.getElementById("calcInput").value);
        if(createCalculator.operationBuffer !== undefined) {
            operationsBinary.summonOperator(createCalculator.operationBuffer, value, true);
        } else {
            updateDisplays( value, value );
            logOperation(value, ` = `, value);
        }
    });
    serviceOperators.addOperator("←", function() {
        var len = document.getElementById("calcInput").value.length;
        if(len == 1)
            document.getElementById("calcInput").value = "0";
        else 
            document.getElementById("calcInput").value = document.getElementById("calcInput").value.substr(0, len-1);
    });
    serviceOperators.addOperator("C", function() {
        document.getElementById("calcInput").value = 0;
        document.getElementById("calcOperands").innerHTML = "";
        document.getElementById("calcError").innerHTML = "";
        operationsBinary.buffer = [];
        createCalculator.operationBuffer = undefined;
        
    });
    serviceOperators.addOperator("FC", function() {
        document.getElementById("calcInput").value = 0;
        document.getElementById("calcOperands").innerHTML = "";
        document.getElementById("calcError").innerHTML = "";
        document.getElementById("calcLog").innerHTML = "";
        operationsBinary.buffer = [];
        createCalculator.operationBuffer = undefined;
    });
    serviceOperators.addOperator("rand", function(a) {
        var rand = Math.random();
        document.getElementById("calcInput").value =  rand;
        logOperation(rand, `random = `, rand);
    } );
    serviceOperators.addOperator("π", function(a) {
        document.getElementById("calcInput").value =  Math.PI;
        logOperation(Math.PI, `π = `, Math.PI);
    } );
    serviceOperators.addOperator("e", function(a) {
        document.getElementById("calcInput").value =  Math.exp(1);
        logOperation(Math.exp(1), `e = `, Math.exp(1));
    } );
}

// =========================================================
//      Service functions
// =========================================================

function addDisplayNumber(num) {
    var calcInput = document.getElementById("calcInput");
    var value = calcInput.value;
    
    if(num == ".") {
        if (value % 1 === 0)
            calcInput.value = +(value) + ".";
    } else if (num == "-") {
        calcInput.value = +(value) * (-1);
    } else {
        if (value == "" || value == "0")
            calcInput.value = num;
        else if (value[value.length-1] == ".")
            calcInput.value = +(value) + "." + num;
        else 
            calcInput.value = +(value) + num;
    }
    
    calcInput.classList.remove("unchanged");
}

function updateDisplays(main, buffer, error) {
    var calcInput = document.getElementById("calcInput");
    
    calcInput.value = main;
    if(!main)
        calcInput.classList.add("unchanged");
    else
        calcInput.classList.remove("unchanged");
    
    if(buffer !== undefined) {
        calcInput.innerHTML = buffer;
    }
    
    if(error !== undefined) {
        calcInput.innerHTML = error;
        setTimeout(clearError, 2000);
    }
}

function clearError() {
    document.getElementById("calcError").innerHTML = "";
}

function logOperation(main, buffer, value) {
    var operationsLog = document.getElementById("calcLog");
    var entry = document.createElement('p');
    entry.className = "log-entry";
    
    if(buffer === undefined) {
        entry.innerHTML = main;
    } else {
        entry.innerHTML = buffer + " " + main;
    }
    
    if(value !== undefined) {
        entry.value = value;
        entry.onclick = function() { updateDisplays(this.value, undefined, "Restored: " + this.innerHTML); }
    }
    
    operationsLog.insertBefore(entry, (document.getElementsByClassName("log-entry"))[0]);
}

function newOperatorButton(name, func, parent) {
    var el = document.createElement('button');
    el.className = "operator";
    el.innerHTML = name;
    el.onclick = func;
    
    parent.appendChild(el);
    
    return el;
}

function newOperatorsContainer(name) {
    var operatorsContainer = document.createElement("div");
    operatorsContainer.id = name;
    operatorsContainer.className = "operators-container";
    document.getElementById("calcOperators").appendChild(operatorsContainer);
    
    return operatorsContainer;
}

// =========================================================
//      Supporting functions
// =========================================================

function factorial(n) {
    if(n == 1 || n == 0) return 1;
    return n*factorial(n-1);
}

// =========================================================
//      Calculator generator
// =========================================================

function createCalculator() {
    prepareCalc();
    
    var operatorsContainer;
    
    // Service Operations
    operatorsContainer = newOperatorsContainer("calcService");
    
    for (operator in serviceOperators.operators) {
        newOperatorButton(operator, function() { serviceOperators.summonOperator(this.innerHTML) }, operatorsContainer);
    }
    
    // Numbers
    operatorsContainer = newOperatorsContainer("calcNumbers");
    
    for (i=1; i<=10; i++) {
        newOperatorButton((i % 10), function() { addDisplayNumber(this.innerHTML) }, operatorsContainer);
    }
    
    newOperatorButton(".", function() { addDisplayNumber(this.innerHTML) }, operatorsContainer);
    
    newOperatorButton("-", function() { addDisplayNumber(this.innerHTML) }, operatorsContainer);
    
    // Binary Operators
    operatorsContainer = newOperatorsContainer("calcBinary");
    
    for (var operator in operationsBinary.operators) {
        newOperatorButton(operator, function() {
            if (!document.getElementById("calcInput").classList.contains("unchanged"))
                operationsBinary.summonOperator(this.innerHTML, document.getElementById("calcInput").value);
        }, operatorsContainer);
    }
    
    // Unary Operators
    operatorsContainer = newOperatorsContainer("calcUnary");
    
    for (operator in operationsUnary.operators) {
        newOperatorButton(operator, function() {
            if (!document.getElementById("calcInput").classList.contains("unchanged"))
                operationsUnary.summonOperator(this.innerHTML, document.getElementById("calcInput").value);
        }, operatorsContainer);
    }
}
createCalculator.operationBuffer = undefined;

// =========================================================
//      Event handler
// =========================================================

document.addEventListener("DOMContentLoaded", function(event) {
    createCalculator();
});
