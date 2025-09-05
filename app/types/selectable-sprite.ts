interface SelectableSprite {
	offset_x: number; // * Set prior to the drawing process but not in the original metadata
	offset_y: number; // * Set prior to the drawing process but not in the original metadata
	scale: number; // * Set prior to the drawing process but not in the original metadata
	flipped: boolean; // * Set prior to the drawing process but not in the original metadata
	original_x: number; // * Written during the drawing process
	original_y: number; // * Written during the drawing process
	drawn_x: number; // * Written during the drawing process
	drawn_y: number; // * Written during the drawing process
	drawn_width: number; // * Written during the drawing process
	drawn_height: number; // * Written during the drawing process
}

export default SelectableSprite;
