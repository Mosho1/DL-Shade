

/**
  *Keeps track of variables and their scope
  *@class ScopeManager
  *@constructor
*/
var ScopeManager = function() {
    this.initialise.apply(this, arguments);
};
ScopeManager.prototype = {

 /**
   *@method initialise

 */
    initialise: function()
    {
        _.bindAll(this);
        this.global = new Scope('__GLOBAL__');
        this.currentScope = this.global;
    },
    /**
     *Creates a new scope.
     *@method createScope
     *@param name The name of the scope
     */
    createScope: function(name)
    {
        var scope = this.currentScope.pushScope(name, this.currentScope);

        if (!scope) {
            console.log("Scope conlict: Cannot define identifier %s in scope %s", name, this.currentScope.name);
            process.exit();
        }

        this.currentScope = scope;
    },

     /**
     *Changes scope.
     *@method changeScope
     *@param scope the name of the scope
     */
     changeScope: function(name)
     {
        var scope = this.currentScope.pushScope(name, this.currentScope);

        if (!scope) {
            console.log("Scope conlict: Cannot define identifier %s in scope %s", name, this.currentScope.name);
            process.exit();
        }

        this.currentScope = scope;
     },
 /**
   *Exits current scope.
   *@method exitScope

 */
    exitScope: function()
    {
        if (!this.currentScope.parent) {
            //Cannot exit global scope
            return;
        }

        this.currentScope = this.currentScope.parent;
    },
 /**
   *Pushes a new identifier into the current scope.
   *@method pushIdentifier
   *@param name The name of the identifier
   *@param node The expression for the identifier
 */
    pushIdentifier: function(name, node)
    {
        this.currentScope.pushIdentifier(name, node);
    },
 /**
   *Pushes new identifiers from a namespace.
   *@method pushNamespace
   *@param ns The namespace
 */
    pushNamespace: function(ns,name)
    {
        for (var v in ns) 
            this.currentScope.pushIdentifier(name+"."+v, {expr:{_type:"Function"}});
    },
 /**
   *Checks if current scope has an Identifier.
   *@method hasIdentifier
   *@param name The name of the identifier
 */
    hasIdentifier: function(name)
    {
        return this.currentScope.hasIdentifier(name);
    },
 /**
   *Gets an Identifier.
   *@method getIdentifier
   *@param name The name of the identifier
 */
    getIdentifier: function(name)
    {
        return this.currentScope.getIdentifier(name);
    }

};
/**
  *Scope class
  *@class Scope
  *@constructor
*/
var Scope = function() {
    this.initialise.apply(this, arguments);
};


Scope.prototype = {

/**
 *@method initialise
 
*/
    initialise: function(name, parent)
    {
        _.bindAll(this);
        this.name = name;
        this.parent = parent;
        this.identifiers = {};
        this.children = {};
    },
/**
 *@method pushIdentifier
 
*/
    pushIdentifier: function(name, node)
    {
        this.identifiers[name] = node;
    },
/**
 *@method hasIdentifier
 
*/
    hasIdentifier: function(name)
    {
        return name in this.identifiers;
    },
/**
 *@method getIdentifier
 
*/
    getIdentifier: function(name)
    {
        return this.identifiers[name];
    },
/**
 *@method pushScope
 
*/
    pushScope: function(name)
    {
        if (this.hasScope(name)) {
            return false;
        }

        this.children[name] = new Scope(name, this);
        return this.children[name];
    },
/**
 *@method hasScope
 
*/
    hasScope: function(name)
    {
        return name in this.children;
    }

};

exports.ScopeManager = ScopeManager;