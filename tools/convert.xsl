<xsl:stylesheet version="1.0"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://wadl.dev.java.net/2009/02 wadl.xsd"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:x="urn:ito:xwadl"
                xmlns:wadl="http://wadl.dev.java.net/2009/02"
                xmlns="http://wadl.dev.java.net/2009/02">

	<xsl:output method="text" encoding="UTF-8" media-type="text/plain"/>

	<xsl:template match="/">
		<xsl:apply-templates select="wadl:application/wadl:resources"/>
	</xsl:template>

	<xsl:template match="wadl:application">
	</xsl:template>

	<xsl:template match="wadl:resources">
		<xsl:text>define({"base":"</xsl:text>
		<xsl:value-of select="@base"/>
		<xsl:text>","resources":{</xsl:text>
		<xsl:apply-templates select="wadl:resource"/>
		<xsl:text>}})</xsl:text>
	</xsl:template>

	<xsl:template match="wadl:resource">
		<xsl:text>"</xsl:text>
		<xsl:call-template name="name"/>
		<xsl:text>":{</xsl:text>
		<xsl:if test="@x:alias">
			<xsl:text>"@":"</xsl:text>
			<xsl:value-of select="@path"/>
			<xsl:text>"</xsl:text>
			<xsl:if test="count(wadl:method) or count(wadl:resource)">,</xsl:if>
		</xsl:if>
		<xsl:apply-templates select="wadl:method"/>
		<xsl:apply-templates select="wadl:resource"/>
		<xsl:text>}</xsl:text>
		<xsl:if test="position() != last()">
			<xsl:text>,</xsl:text>
		</xsl:if>
	</xsl:template>

	<xsl:template match="wadl:resource[@type = 'transparent']">
		<xsl:apply-templates select="wadl:method"/>
		<xsl:if test="following-sibling::*">,</xsl:if>
		<xsl:apply-templates select="wadl:resource"/>
	</xsl:template>

	<xsl:template match="wadl:method">
		<xsl:text>"</xsl:text>
		<xsl:value-of select="@name"/>
		<xsl:if test="@x:secure='true' or parent::wadl:resource/@x:secure='true'">
			<xsl:text>*</xsl:text>
		</xsl:if>
		<xsl:for-each select="ancestor::wadl:resource/wadl:param">
			<xsl:text>#\\</xsl:text>
			<xsl:value-of select="@name"/>
		</xsl:for-each>
		<xsl:for-each select="wadl:request/wadl:param[@required='true']">
			<xsl:text>#</xsl:text>
			<xsl:value-of select="@name"/>
		</xsl:for-each>
		<xsl:text>":"</xsl:text>
		<xsl:choose>
			<xsl:when test="wadl:response/wadl:representation[@id != '' and @id != 'error']/@id">
				<xsl:value-of select="wadl:response/wadl:representation[@id != '' and @id != 'error']/@id"/>
			</xsl:when>
			<xsl:when test="wadl:response/wadl:representation[1]/wadl:param[@required='true']">
				<xsl:value-of
						select="wadl:response/wadl:representation[1]/wadl:param[1][@required = 'true' and @style != 'header']/@name"/>
			</xsl:when>
		</xsl:choose>
		<xsl:text>"</xsl:text>
		<xsl:if test="@x:alias">
			<xsl:text>,":</xsl:text>
			<xsl:value-of select="@x:alias"/>
			<xsl:text>":"</xsl:text>
			<xsl:value-of select="@name"/>
			<xsl:text>"</xsl:text>
		</xsl:if>
		<xsl:if test="following-sibling::*">,</xsl:if>
	</xsl:template>

	<xsl:template name="name">
		<xsl:choose>
			<xsl:when test="@x:alias">
				<xsl:value-of select="@x:alias"/>
			</xsl:when>
			<xsl:when test="@path">
				<xsl:value-of select="@path"/>
			</xsl:when>
			<xsl:when test="@name">
				<xsl:value-of select="@name"/>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="argument">

	</xsl:template>

</xsl:stylesheet>