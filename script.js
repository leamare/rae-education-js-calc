function factorial(n) {
    if(n == 1 || n == 0) return 1;
    else return n*factorial(n-1);
}

var operationsUnary = { operators: {} };

operationsUnary.addOperator = function(name, func) {
    this.operators[name] = func;
};

operationsUnary.summonOperator = function(name, value) {
    if(this.operators[name] === undefined) throw new Error("Operator wasn't found");
    var main; 
    try {
        main = (this.operators[name])( +value );
        logOperation(main, name + " " + value + " =", main);
        updateDisplays(main);
    } catch (e) {
        main = +value;
        logOperation(main, "[E]: "+e + " :: " + name + " " + value + " =");
        updateDisplays(main, undefined, "[E]: "+e);
    }
};

var operationsBinary = { operators: {}, buffer: [] };

operationsBinary.addOperator = function(name, func) {
    this.operators[name] = func;
    this.buffer[name] = [];
};

operationsBinary.summonOperator = function(name, value) {
    if(this.operators[name] === undefined) throw new Error("Operator wasn't found");
    this.buffer.push(+value);
    if(this.buffer.length == 2) {
        var buffer = this.buffer[0] + " " + name + " " + this.buffer[1] + " " + "=";
        var main; 
        try {
            main = (this.operators[name])( this.buffer[0], this.buffer[1] );
            logOperation(main, buffer, main);
            updateDisplays(main, buffer);
        } catch (e) {
            main = 0;
            logOperation(main, "[E]: "+e+" :: "+buffer);
            updateDisplays(main, buffer, "[E]: "+e);
        }
        this.buffer = [];
        createCalculator.operationBuffer = undefined;
    } else {
        var buffer = this.buffer[0] + " " + name;
        updateDisplays(0, buffer);
        createCalculator.operationBuffer = name;
    }
};

var serviceOperators = { operators: {} };

serviceOperators.addOperator = function(name, func) {
    this.operators[name] = func;
};

serviceOperators.summonOperator = function(name) {
    (this.operators[name])();
};

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
        if(createCalculator.operationBuffer !== undefined) {
            operationsBinary.summonOperator(createCalculator.operationBuffer, document.getElementById("calcInput").value);
        } else {
            updateDisplays( +(document.getElementById("calcInput").value), +(document.getElementById("calcInput").value) );
        }
    });
    serviceOperators.addOperator("C", function() {
        document.getElementById("calcInput").value = 0;
        document.getElementById("calcOperands").innerHTML = "";
        document.getElementById("calcError").innerHTML = "";
    });
    serviceOperators.addOperator("FC", function() {
        document.getElementById("calcInput").value = 0;
        document.getElementById("calcOperands").innerHTML = "";
        document.getElementById("calcError").innerHTML = "";
        document.getElementById("calcLog").innerHTML = "";
    });
    serviceOperators.addOperator("rand", function(a) { document.getElementById("calcInput").value =  Math.random(); } );
    serviceOperators.addOperator("π", function(a) { document.getElementById("calcInput").value =  Math.PI; } );
}

function createCalculator() {
    prepareCalc();
    
    var el;
    var operatorsContainer = document.getElementById("calcBinary");
    for (var operator in operationsBinary.operators) {
        el = document.createElement('button');
        el.className = "operator";
        el.innerHTML = operator;
        el.onclick = function() { operationsBinary.summonOperator(this.innerHTML, document.getElementById("calcInput").value) };
        operatorsContainer.appendChild(el);
    }
    
    operatorsContainer = document.getElementById("calcUnary");
    for (operator in operationsUnary.operators) {
        el = document.createElement('button');
        el.className = "operator";
        el.innerHTML = operator;
        el.onclick = function() { operationsUnary.summonOperator(this.innerHTML, document.getElementById("calcInput").value) };
        operatorsContainer.appendChild(el);
    }
    
    operatorsContainer = document.getElementById("calcService");
    for (operator in serviceOperators.operators) {
        el = document.createElement('button');
        el.className = "operator";
        el.innerHTML = operator;
        el.onclick = function() { serviceOperators.summonOperator(this.innerHTML) };
        operatorsContainer.appendChild(el);
    }
    
    operatorsContainer = document.getElementById("calcNumbers");
    for (i=1; i<=10; i++) {
        el = document.createElement('button');
        el.className = "operator";
        el.innerHTML = (i % 10);
        el.onclick = function() { addDisplayNumber(this.innerHTML) };
        operatorsContainer.appendChild(el);
    }
    
    el = document.createElement('button');
    el.className = "operator";
    el.innerHTML = ".";
    el.onclick = function() { addDisplayNumber(this.innerHTML) };
    operatorsContainer.appendChild(el);
}
createCalculator.operationBuffer = undefined;

function addDisplayNumber(num) {
    var value = document.getElementById("calcInput").value;
    
    if(num == ".") {
        if (value % 1 === 0)
            document.getElementById("calcInput").value = +(value) + ".";
    } else {
        if (value == "" || value == "0")
            document.getElementById("calcInput").value = num;
        else if (value[value.length-1] == ".")
            document.getElementById("calcInput").value = +(value) + "." + num;
        else 
            document.getElementById("calcInput").value = +(value) + num;
    }
}

function updateDisplays(main, buffer, error) {
    document.getElementById("calcInput").value = main;
    document.getElementById("calcInput").focus();
    
    if(buffer !== undefined) {
        document.getElementById("calcOperands").innerHTML = buffer;
    }
    
    if(error !== undefined) {
        document.getElementById("calcError").innerHTML = error;
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
        entry.onclick = function() { updateDisplays(this.value, "Restored: " + this.innerHTML); }
    }
    
    operationsLog.insertBefore(entry, (document.getElementsByClassName("log-entry"))[0]);
}
