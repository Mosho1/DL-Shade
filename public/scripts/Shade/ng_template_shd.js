<%
var handleAttributes = function (value, attr) {
     if (shd.attrNameHandlers.hasOwnProperty(attr)) {
        %> <%=shd.attrNameHandlers[attr] || attr.toDash()%> = "<%=shd.attrValueHandlers[value] || value.toLowerCase()%>" <%}
    },
    

    //wrappers for creating HTML elements. Creates enumerated CSS classes for each element with style(s).
    openElement = function (elmName, nativeClass, className, node, customStyles, customAttr, content, nodes, close) {

        %><<%=elmName%><%
        if (className || nativeClass) {
            %> class = "<%=className%> <%=nativeClass%>"<%
        }
        %> <%=customAttr%><%
        _.each(node, handleAttributes)%><%=close?'':' /'%>><%
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
                    elm.nodes,
                    elm.close);
        if (elm.close) {
            closeElement(elm.elmName);
        }
    };

if (shd) {
    _.each(shd.elements, handleElement); 
}
%>