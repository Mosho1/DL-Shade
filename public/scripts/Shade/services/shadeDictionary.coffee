angular.module("ShadeApp")

.service("ShadeIdentifiers", (ShadeStaticHandlers, ShadeHandlers) ->
  sh = ShadeStaticHandlers
  sw = ShadeHandlers
  ((key, an, av, sn, sv, c, cb, mn) ->
    attrNames:
      type: "Attribute Name"
      keys: key(an or {})

    attrValues:
      type: "Attribute Value"
      keys: key(av or {})

    styleNames:
      type: "Style Name"
      keys: key(sn or {})

    styleValues:
      type: "Style Value"
      keys: key(sv or {})

    controls:
      type: "Control"
      keys: key(c or {})

    controlBlocks:
      type: "Control Block"
      keys: key(cb or {})

    mainNodes:
      type: ""
      keys: key(mn or {})
  ) Object.keys, sh.attrNameHandlers, sh.attrValueHandlers, sh.styleNameHandlers, sh.styleValueHandlers, sw.UIHandlers, sw.CbHandlers, sw.nodeHandlers
)

.service "ShadeAttrDictionary", (ShadeStaticHandlers) ->
  attrNameHandlers: ShadeStaticHandlers.attrNameHandlers
  attrValueHandlers: ShadeStaticHandlers.attrValueHandlers
