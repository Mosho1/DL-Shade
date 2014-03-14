<%
var handleAttributes = function (value, attr) {
     if (shd.attrNameHandlers.hasOwnProperty(attr)) {
        %> <%=shd.attrNameHandlers[attr] || attr%> = "<%=shd.attrValueHandlers[value] || value%>" <%}
    },
    

    //wrappers for creating HTML elements. Creates enumerated CSS classes for each element with style(s).
    openElement = function (elmName, nativeClass, className, node, customStyles, nodes) {

        %><<%=elmName%> <%
        if (className || nativeClass) {
            %>class = "<%=className%> <%=nativeClass%>"<%
        } 
        _.each(node, handleAttributes)%>><% 

        _.each(nodes, handleElement);


    },
    closeElement = function (elmName) {
        %></<%=elmName%>><%
    },
    
    handleElement = function (elm) {
        openElement(elm.elmName,
                    elm.nativeClass,
                    elm.className,
                    elm.node,
                    elm.customStyles,
                    elm.nodes);

        closeElement(elm.elmName);
    };

if (shd) {
    _.each(shd.elements, handleElement); 
}
%>