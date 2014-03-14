<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ixsl="http://saxonica.com/ns/interactiveXSLT"
  xmlns:prop="http://saxonica.com/ns/html-property"
  xmlns:style="http://saxonica.com/ns/html-style-property"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs prop"
  extension-element-prefixes="ixsl"
  version="2.0"
  >

    <xsl:output omit-xml-declaration="yes" indent="yes" />
    <xsl:variable name="cols" select="/*/*/Cols" />
    <xsl:variable name="rows" select="/*/*/Rows" />
    <xsl:variable name="lg" select="12 div number(/*/*/Cols)" />

    <xsl:template match="/Shade">
        <xsl:apply-templates />
    </xsl:template>

    <xsl:template match="Node[UI[contains(., 'Grid')]]">
        <xsl:param name="cols" select ="./Cols" />
        
        <div class="container">
            <xsl:apply-templates select="Node[position() mod $cols = 1][position() &lt;= $rows]" mode="row"/>
        </div>
    </xsl:template>

    <xsl:template match="Node" mode="row">
        <div class="row">
            <xsl:apply-templates select="self::*|following-sibling::Node[position() &lt; $cols]" mode="cell"/>
        </div>
    </xsl:template>

    <xsl:template match="Node" mode="cell">
        <div class="col-lg-{$lg}">
            <xsl:apply-templates />
        </div>
    </xsl:template>

</xsl:transform>
