package au.org.ala.profile.hub

enum ImageOption {
    INCLUDE, EXCLUDE

    static ImageOption byName(String name, ImageOption defaultOption = null) {
        ImageOption option = values().find { it.name() == name }

        option ?: defaultOption
    }
}