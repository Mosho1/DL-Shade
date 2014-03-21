<%
var handleAttributes = function (value, attr) {
     if (shd.attrNameHandlers.hasOwnProperty(attr)) {
        %> <%=shd.attrNameHandlers[attr] || attr.toLowerCase()%> = "<%=shd.attrValueHandlers[value] || value.toLowerCase()%>" <%}
    },
    

    //wrappers for creating HTML elements. Creates enumerated CSS classes for each element with style(s).
    openElement = function (elmName, nativeClass, className, node, customStyles, customAttr, content, nodes) {

        %><<%=elmName%> <%
        if (className || nativeClass) {
            %>class = "<%=className%> <%=nativeClass%>"<%
        }
        %> <%=customAttr%> <%
        _.each(node, handleAttributes)%>><% 
        %><%=content%><%
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
                    elm.customAttr,
                    elm.content,
                    elm.nodes);

        closeElement(elm.elmName);
    };

if (shd) {
    _.each(shd.elements, handleElement); 
}
%>