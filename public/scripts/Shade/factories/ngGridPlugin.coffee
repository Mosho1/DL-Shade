angular.module('ShadeApp')

.factory 'ngGridFlexibleHeightPlugin', () ->
    ngGridFlexibleHeightPlugin = (opts) ->
      self = this
      self.grid = null
      self.scope = null
      self.init = (scope, grid, services) ->
        self.domUtilityService = services.DomUtilityService
        self.grid = grid
        self.scope = scope
        recalcHeightForData = ->
          setTimeout innerRecalcForData, 1
          return

        innerRecalcForData = ->
          gridId = self.grid.gridId
          footerPanelSel = "." + gridId + " .ngFooterPanel"
          extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height()
          naturalHeight = self.grid.$canvas.height() + 1
          if opts?
            naturalHeight = opts.minHeight - extraHeight - 2  if opts.minHeight? and (naturalHeight + extraHeight) < opts.minHeight
            naturalHeight = opts.maxHeight - extraHeight - 2  if opts.maxHeight? and (naturalHeight + extraHeight) > opts.maxHeight
          newViewportHeight = naturalHeight + 2
          if not self.scope.baseViewportHeight or self.scope.baseViewportHeight isnt newViewportHeight
            self.grid.$viewport.css "height", newViewportHeight + "px"
            self.grid.$root.css "height", (newViewportHeight + extraHeight) + "px"
            self.scope.baseViewportHeight = newViewportHeight
            self.domUtilityService.RebuildGrid self.scope, self.grid
          return

        self.scope.catHashKeys = ->
          hash = ""
          idx = undefined
          for idx of self.scope.renderedRows
            hash += self.scope.renderedRows[idx].$$hashKey
          hash

        self.scope.$watch "catHashKeys()", innerRecalcForData
        self.scope.$watch self.grid.config.data, recalcHeightForData
        return

      return