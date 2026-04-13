        {/* {{SECTION_NAME}} Section */}
        <Animated.View entering={FadeInDown.duration(400).delay({{DELAY}})} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.{{ICON_COLOR}} + "15" }]}>
              <IconSymbol name="{{ICON_NAME}}" size={18} color={colors.{{ICON_COLOR}}} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t.settings.{{SECTION_KEY}}}</Text>
          </View>
          
          <View style={[styles.{{CARD_STYLE}}, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {{CARD_CONTENT}}
          </View>
          <Text style={[styles.{{HINT_STYLE}}, { color: colors.muted }]}>{t.settings.{{HINT_KEY}}}</Text>
        </Animated.View>
