<xsl:stylesheet version="1.0"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://wadl.dev.java.net/2009/02 wadl.xsd"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                xmlns:x="urn:ito:xwadl"
                xmlns:wadl="http://wadl.dev.java.net/2009/02"
                xmlns="http://wadl.dev.java.net/2009/02"
				xmlns:config="urn:ito:routing">

	<xsl:output method="text" encoding="UTF-8" media-type="text/plain"/>

	<xsl:param name="config" select="config"/>

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

		<xsl:variable name="feature-friendly">
			<xsl:variable name="include">
				<xsl:if test="normalize-space(string-length(@config:include)) > 0">
					<xsl:value-of select="concat(',', @config:include, ',')" />
				</xsl:if>
			</xsl:variable>
			<xsl:variable name="exclude">
				<xsl:if test="normalize-space(string-length(@config:exclude)) > 0">
					<xsl:value-of select="concat(',', @config:exclude, ',')" />
				</xsl:if>
			</xsl:variable>
			<xsl:choose>
				<xsl:when test="$config">
					<xsl:for-each select="document($config)/config/features/*">
						<xsl:if test="(normalize-space(string-length($include)) = 0 or contains($include, concat(',', name(.), ',')))
							and not(contains($exclude, concat(',', name(.), ',')))">true</xsl:if>
					</xsl:for-each>
				</xsl:when>
				<xsl:otherwise></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:if test="$feature-friendly = 'true'">
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
		</xsl:if>

	</xsl:template>

	<xsl:template match="*">
	</xsl:template>

	<xsl:template match="wadl:resource[@type = 'transparent']">
		<xsl:apply-templates select="wadl:method"/>
		<xsl:if test="following-sibling::*">,</xsl:if>
		<xsl:apply-templates select="wadl:resource"/>
	</xsl:template>

	<xsl:template match="wadl:resource[@type='x:events']">
	</xsl:template>

	<xsl:template match="wadl:method">
		<xsl:text>"</xsl:text>
		<xsl:value-of select="@name"/>
		<xsl:choose>
			<xsl:when test="ancestor-or-self::wadl:resource/@x:secure='true'">
				<xsl:text>*</xsl:text>
			</xsl:when>
			<xsl:otherwise>
				<xsl:if test="not(@name='GET')">
					<xsl:text>*</xsl:text>
				</xsl:if>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:apply-templates select="ancestor::wadl:resource/wadl:param|wadl:request/wadl:param[@required='true']"/>
		<xsl:text>":"</xsl:text>
		<xsl:apply-templates select="wadl:response[substring(@status, 1, 1)='2']/wadl:representation"/>
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

	<xsl:template match="wadl:representation">
		<xsl:value-of select="wadl:param[not(@style='header')]/@name"/>
		<xsl:apply-templates select="wadl:param[@x:variable]"/>
	</xsl:template>

	<xsl:template match="wadl:representation/wadl:param[@x:variable]">
		<xsl:text>=</xsl:text>
		<xsl:value-of select="@x:variable"/>
	</xsl:template>

	<xsl:template match="wadl:param">
		<xsl:text>#</xsl:text>
		<xsl:if test="@style='template'">/</xsl:if>
		<xsl:choose>
			<xsl:when test="substring(@default, 1, 1)='{' and substring(@default, string-length(@default))='}'">
				<xsl:text>{</xsl:text>
				<xsl:value-of select="@name"/>
				<xsl:text>=</xsl:text>
				<xsl:value-of select="substring(@default, 2, string-length(@default)-2)"/>
				<xsl:text>}</xsl:text>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="@name"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="name">
		<xsl:choose>
			<xsl:when test="@x:alias">
				<xsl:value-of select="@x:alias"/>
			</xsl:when>
			<xsl:when test="@path">
                <xsl:choose>
                    <xsl:when test="substring(@path, 2, 1)='*'">
                        <xsl:text>{</xsl:text>
                        <xsl:value-of select="substring(@path, 3, string-length(@path) - 3)"/>
                        <xsl:text>}</xsl:text>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="@path"/>
                    </xsl:otherwise>
                </xsl:choose>
			</xsl:when>
			<xsl:when test="@name">
                <xsl:value-of select="@name"/>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="argument">
	</xsl:template>

</xsl:stylesheet>