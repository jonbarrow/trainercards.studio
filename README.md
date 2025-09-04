# Trainer Cards Studio

Custom Pokémon trainer card creator

## Features

- 34,949 Pokémon sprites
- 2,241 trainer images
- 13 card templates in both classic and "modern" (pokecharms) styles
- Animated trainer cards in various video formats
- Each image can be in any style and on any card, allowing you to mix and match any combination
- Support for showing what Pokéball each Pokémon is in
- Support for giving each Pokémon a held item

## Configuration

| Name                     | Description                                                                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TCS_IMAGE_HOST`         | Changes the hostname used for serving all images. Can be overridden. If not set, images will be served either from one of the below hostnames or from the local server. Only changes the host, image paths remain the same. |
| `TCS_POKEMON_IMAGE_HOST` | Changes the hostname used for serving Pokemon images. Overrides `TCS_IMAGE_HOST` if set. If not set, images will be served from the local server. Only changes the host, image paths remain the same.                       |
| `TCS_TRAINER_IMAGE_HOST` | Changes the hostname used for serving trainer images. Overrides `TCS_IMAGE_HOST` if set. If not set, images will be served from the local server. Only changes the host, image paths remain the same.                       |
| `TCS_BADGE_IMAGE_HOST`   | Changes the hostname used for serving badge images. Overrides `TCS_IMAGE_HOST` if set. If not set, images will be served from the local server. Only changes the host, image paths remain the same.                         |
| `TCS_FONT_IMAGE_HOST`    | Changes the hostname used for serving font images. Overrides `TCS_IMAGE_HOST` if set. If not set, images will be served from the local server. Only changes the host, image paths remain the same.                          |

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for details on how to contribute.

## Credits / Attributions

This project would not be possible without outside help. All credits/attributions for external resources (even those which state they do not need credit) can be found in [ATTRIBUTIONS.md](ATTRIBUTIONS.md). Resources made specifically for the project are (generally) attributed via the git history, but may also be placed in [ATTRIBUTIONS.md](ATTRIBUTIONS.md).

## License

This project contains assets from multiple sources with different licensing terms:

### Code and Original Assets
All source code and original assets created by project maintainers/contributors are licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**. See the [LICENSE](LICENSE) file for full terms.

### Third-Party Copyrighted Assets
This project includes assets that are copyrighted by their respective owners:

- **Pokémon-related assets**: Images, sprites, and other materials are copyrighted by Nintendo Co., Ltd., The Pokémon Company, and Game Freak Inc. These assets are used under fair use provisions for educational/non-commercial purposes.
- **Other third-party assets**: Various images and resources from the wider internet are used with attribution. See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for detailed credits and sources.

### Modified Assets
Some assets in this project are modified versions of copyrighted materials. While the modifications themselves may be considered derivative works, the underlying copyrighted material remains the property of the original copyright holders.

### Important Notice
- The copyrighted assets are **NOT** covered by the AGPLv3 license
- If you fork or distribute this project, ensure you comply with the rights of all copyright holders
- When in doubt, replace copyrighted assets with your own original creations or properly licensed alternatives
- See the [`PokeAPI/sprites`](https://github.com/PokeAPI/sprites/blob/9683e1d7ffbab3401c1542e39d8105102153e6f9/LICENCE.txt) license for copyrighted sprites
- See the [`msikma/pokesprit`](https://github.com/msikma/pokesprite/blob/c5aaa610ff2acdf7fd8e2dccd181bca8be9fcb3e/license.md) license for custom sprites
