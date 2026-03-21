-- Since files on the wiki have different names than the actual files,
-- this is a list for maintenance and easy updates
local wikiCustomOverride = {
	ENERGY = {
		AUTO = "IconEnergy.gif"
	},
	HEALTH = {
		AUTO = "HealOrb.png"
	},
	SHIELD = {
		AUTO = "IconShield.png"
	},
	MADURAI_CLEAN = {
		AUTO = "IconFocusCleanMadurai.png"
	},
	NARAMON_CLEAN = {
		AUTO = "IconFocusCleanNaramon.png"
	},
	UNAIRU_CLEAN = {
		AUTO = "IconFocusCleanUnairu.png"
	},
	VAZARIN_CLEAN = {
		AUTO = "IconFocusCleanVazarin.png"
	},
	ZENURIK_CLEAN = {
		AUTO = "IconFocusCleanZenurik.png"
	},
	
	
	SECONDARY_FIRE = {
		AUTO = "MouseWheelButton d.png"
	},
	PRE_ATTACK = {
		AUTO = "MouseButton00 d.png"
	}
}

-- https://github.com/calamity-inc/warframe-public-export-plus/blob/senpai/ExportTextIcons.json
-- last updated 41.1.0
local data = {
	GAMEPAD_LTHUMB = {
		PS4 = "PS4_L3_d.png",
		XBONE = "XboxOneJoystickLClick_d.png",
		STEAM = "StickClick.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchLStickPress_d.png"
	},
	GAMEPAD_LTHUMB_PUSH = {
		PS4 = "PS4AnalogStickLPush_d.png",
		XBONE = "XBoxOneAnalogStickLPush_d.png",
		STEAM = "StickPush_d.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchLStickPress_d.png"
	},
	GAMEPAD_RTHUMB = {
		PS4 = "PS4_R3_d.png",
		XBONE = "XboxOneJoystickRClick_d.png",
		STEAM = "PadRightClick.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchRStickPress_d.png"
	},
	GAMEPAD_RTHUMB_PUSH = {
		PS4 = "PS4AnalogStickRPush_d.png",
		XBONE = "XBoxOneAnalogStickRPush_d.png",
		STEAM = "PadRightPush_d.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchRStickPress_d.png"
	},
	GAMEPAD_X = {
		PC = "XboxOneA_d.png",
		PS4 = "PS4_Cross_d.png",
		XBONE = "XboxOneA_d.png",
		STEAM = "ButtonA.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchB_d.png"
	},
	GAMEPAD_X_TAP = {
		PS4 = "PS4_Cross_d.png",
		XBONE = "XboxOneA_d.png",
		STEAM = "ButtonA.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchB_d.png"
	},
	GAMEPAD_CIRCLE = {
		PC = "XboxOneB_d.png",
		PS4 = "PS4_Circle_d.png",
		XBONE = "XboxOneB_d.png",
		STEAM = "ButtonB.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchA_d.png"
	},
	GAMEPAD_CIRCLE_TAP = {
		PS4 = "PS4_Circle_d.png",
		XBONE = "XboxOneB_d.png",
		STEAM = "ButtonB.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchA_d.png"
	},
	GAMEPAD_SQUARE = {
		PC = "XboxOneX_d.png",
		PS4 = "PS4_Square_d.png",
		XBONE = "XboxOneX_d.png",
		STEAM = "ButtonX.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchY_d.png"
	},
	GAMEPAD_SQUARE_TAP = {
		PS4 = "PS4_Square_d.png",
		XBONE = "XboxOneX_d.png",
		STEAM = "ButtonX.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchY_d.png"
	},
	GAMEPAD_TRIANGLE = {
		PC = "XboxOneY_d.png",
		PS4 = "PS4_Triangle_d.png",
		XBONE = "XboxOneY_d.png",
		STEAM = "ButtonY.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchX_d.png"
	},
	GAMEPAD_TRIANGLE_TAP = {
		PS4 = "PS4_Triangle_d.png",
		XBONE = "XboxOneY_d.png",
		STEAM = "ButtonY.png",
		AGNOSTIC = "Empty.png"
	},
	GAMEPAD_L2 = {
		PS4 = "PS4_L1_d.png",
		XBONE = "XboxOneLB_d.png",
		STEAM = "ShoulderLeft.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchL_d.png"
	},
	GAMEPAD_R2 = {
		PS4 = "PS4_R1_d.png",
		XBONE = "XboxOneRB_d.png",
		STEAM = "ShoulderRight.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchR_d.png"
	},
	GAMEPAD_L1 = {
		PS4 = "PS4_L2_d.png",
		XBONE = "XboxOneLT_d.png",
		STEAM = "TriggerLeftClick.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchZL_d.png"
	},
	GAMEPAD_R1 = {
		PS4 = "PS4_R2_d.png",
		XBONE = "XboxOneRT_d.png",
		STEAM = "TriggerRightClick.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchZR_d.png"
	},
	GAMEPAD_RX = {
		PS4 = "PS4RightAnalog_d.png",
		XBONE = "XboxOneJoystickR_d.png",
		STEAM = "PadRight.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchRStick_d.png"
	},
	GAMEPAD_RY_TILT_DOWN = {
		PS4 = "PS4RTiltDown_d.png",
		XBONE = "XboxOneJoystickRDown_d.png",
		STEAM = "PadRightDown_d.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchRStickDown_d.png"
	},
	GAMEPAD_RY_TILT_UD = {
		PS4 = "PS4RUpDown_d.png",
		XBONE = "XboxOneJoystickRUpDown_d.png",
		STEAM = "PadRightTildUD_d.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchRStickUp_d.png"
	},
	GAMEPAD_RY_TILT_FOUR = {
		PS4 = "PS4RTiltFour_d.png",
		XBONE = "XBoxOneAnalogStickRTiltFour_d.png",
		STEAM = "PadRightTiltFour_d.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchRStickPress_d.png"
	},
	GAMEPAD_LY = {
		PS4 = "PS4LeftAnalog_d.png",
		XBONE = "XboxOneJoystickL_d.png",
		STEAM = "Stick.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchLStick_d.png"
	},
	GAMEPAD_RY = {
		PS4 = "PS4RightAnalog_d.png",
		XBONE = "XboxOneJoystickR_d.png",
		STEAM = "PadRight.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchRStick_d.png"
	},
	GAMEPAD_LX = {
		PS4 = "PS4LeftAnalog_d.png",
		XBONE = "XboxOneJoystickL_d.png",
		STEAM = "Stick.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchLStick_d.png"
	},
	GAMEPAD_LY_TILT_UD = {
		PS4 = "PS4LUpDown_d.png",
		XBONE = "XboxOneJoystickLUpDown_d.png",
		STEAM = "PadRightTildUD_d.png",
		AGNOSTIC = "Empty.png"
	},
	GAMEPAD_START = {
		PS4 = "PS4_Options01_d.png",
		XBONE = "XboxOneMenu_d.png",
		STEAM = "ButtonStart.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchPlus_d.png",
		PS5 = "PS5_Options01_d.png"
	},
	GAMEPAD_SELECT = {
		PS4 = "PS4_share01_d.png",
		XBONE = "XboxOneView_d.png",
		STEAM = "ButtonSelect.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchMinus_d.png",
		PS5 = "PS5_Create01_d.png"
	},
	GAMEPAD_DPAD = {
		PS4 = "PS4D-PadFull_d.png",
		XBONE = "XboxOneDPad_d.png",
		STEAM = "PadLeft.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchCircleDPad_d.png"
	},
	GAMEPAD_UP = {
		PS4 = "PS4_D-PadUp_d.png",
		XBONE = "XboxOneDPadUp_d.png",
		STEAM = "PadLeftDpadNorth.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchCircleDPadUp_d.png"
	},
	GAMEPAD_DOWN = {
		PS4 = "PS4_D-PadDown_d.png",
		XBONE = "XboxOneDPadDown_d.png",
		STEAM = "PadLeftDpadSouth.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchCircleDPadDown_d.png",
		IOS = "IOSEmotes_d.png",
		ANDROID = "IOSEmotes_d.png"
	},
	GAMEPAD_LEFT = {
		PS4 = "PS4_D-PadLeft_d.png",
		XBONE = "XboxOneDPadLeft_d.png",
		STEAM = "PadLeftDpadWest.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchCircleDPadLeft_d.png"
	},
	GAMEPAD_RIGHT = {
		PS4 = "PS4_D-PadRight_d.png",
		XBONE = "XboxOneDPadRight_d.png",
		STEAM = "PadLeftDpadEast.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchCircleDPadRight_d.png"
	},
	GAMEPAD_LR = {
		PS4 = "PS4DPadLR_d.png",
		PC = "PCDoubleArrow_d.png",
		XBONE = "XboxDPadLR_d.png",
		STEAM = "PadLeftLR_d.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchDPadLeft_d.png"
	},
	GAMEPAD_UD = {
		PS4 = "PS4DPadUD_d.png",
		PC = "PCKeyUD_d.png",
		XBONE = "XboxDPadUD_d.png",
		STEAM = "PadLeftUD_d.png",
		AGNOSTIC = "Empty.png",
		SWITCH = "SwitchDPadUp_d.png"
	},
	GAMEPAD_CAPTURE = {
		SWITCH = "SwitchCaptureGame_d.png"
	},
	SPACE = {
		PC = "Space_d.png",
		XBONE = "Space_d.png"
	},
	ESCAPE = {
		PC = "Esc_d.png",
		XBONE = "Esc_d.png"
	},
	PRIOR = {
		PC = "PageUp_d.png",
		XBONE = "PageUp_d.png"
	},
	NEXT = {
		PC = "PageDown_d.png",
		XBONE = "PageDown_d.png"
	},
	RETURN = {
		PC = "KeyboardEnter_d.png",
		XBONE = "KeyboardEnter_d.png"
	},
	BACK = {
		PC = "Backspace_d.png",
		XBONE = "Backspace_d.png"
	},
	NUMLOCK = {
		PC = "NumLock_d.png",
		XBONE = "NumLock_d.png"
	},
	KEY = {
		PC = "KeyboardPiece_d.png",
		XBONE = "KeyboardPiece_d.png"
	},
	KEYWIDE = {
		PC = "KeyboardPieceWide_d.png",
		XBONE = "KeyboardPieceWide_d.png"
	},
	MOUSE_B0 = {
		PC = "MouseButton00_d.png",
		XBONE = "MouseButton00_d.png",
		IOS = "IOSTap1_d.png",
		ANDROID = "IOSTap1_d.png"
	},
	MOUSE_B1 = {
		PC = "MouseButton01_d.png",
		XBONE = "MouseButton01_d.png"
	},
	MOUSE_B2 = {
		PC = "MouseWheelButton_d.png",
		XBONE = "MouseWheelButton_d.png"
	},
	MOUSE_B3 = {
		PC = "MouseButton4_d.png",
		XBONE = "MouseButton4_d.png"
	},
	MOUSE_B4 = {
		PC = "MouseButton5_d.png",
		XBONE = "MouseButton5_d.png"
	},
	UP = {
		PC = "UpArrow_d.png",
		XBONE = "UpArrow_d.png"
	},
	DOWN = {
		PC = "DownArrow_d.png",
		XBONE = "DownArrow_d.png"
	},
	LEFT = {
		PC = "LeftArrow_d.png",
		XBONE = "LeftArrow_d.png"
	},
	RIGHT = {
		PC = "RightArrow_d.png",
		XBONE = "RightArrow_d.png",
		IOS = "RightArrow_d.png",
		ANDROID = "RightArrow_d.png"
	},
	TAB = {
		PC = "Tab_d.png",
		XBONE = "Tab_d.png"
	},
	DELETE = {
		PC = "Del_d.png",
		XBONE = "Del_d.png"
	},
	LSHIFT = {
		PC = "LShift_d.png",
		XBONE = "LShift_d.png"
	},
	RBRACKET = {
		PC = "RBracket_d.png",
		XBONE = "RBracket_d.png"
	},
	LBRACKET = {
		PC = "LBracket_d.png",
		XBONE = "LBracket_d.png"
	},
	MOUSE_X = {
		PC = "MouseSideToSide_d.png",
		XBONE = "MouseSideToSide_d.png"
	},
	MOUSE_Y = {
		PC = "MouseFwdBkwd_d.png",
		XBONE = "MouseFwdBkwd_d.png"
	},
	MOUSE_WHEELUP = {
		PC = "MouseWheelScrollA_d.png",
		XBONE = "MouseWheelScrollA_d.png"
	},
	MOUSE_WHEELDOWN = {
		PC = "MouseWheelScrollC_d.png",
		XBONE = "MouseWheelScrollC_d.png"
	},
	ARROW_RIGHT = {
		AUTO = "Chevron_d.png"
	},
	REGISTERED_TRADEMARK = {
		AUTO = "RegisteredTrademark_d.png"
	},
	REGISTERED_TM_SMALL = {
		AUTO = "RegisteredTrademarkSmall_d.png"
	},
	TM_SMALL = {
		AUTO = "TrademarkSmall_d.png"
	},
	SM_SMALL = {
		AUTO = "ServicemarkSmall_d.png"
	},
	F1 = {
		AUTO = "F1_d.png"
	},
	F2 = {
		AUTO = "F2_d.png"
	},
	F3 = {
		AUTO = "F3_d.png"
	},
	F4 = {
		AUTO = "F4_d.png"
	},
	F5 = {
		AUTO = "F5_d.png"
	},
	F6 = {
		AUTO = "F6_d.png"
	},
	F7 = {
		AUTO = "F7_d.png"
	},
	F8 = {
		AUTO = "F8_d.png"
	},
	F9 = {
		AUTO = "F9_d.png"
	},
	F10 = {
		AUTO = "F10_d.png"
	},
	F11 = {
		AUTO = "F11_d.png"
	},
	F12 = {
		AUTO = "F12_d.png"
	},
	GRAVE = {
		AUTO = "Grave_d.png"
	},
	MINUS = {
		AUTO = "Minus_d.png"
	},
	EQUALS = {
		AUTO = "Equals_d.png"
	},
	BACKSLASH = {
		AUTO = "BackwardSlash_d.png"
	},
	CAPITAL = {
		AUTO = "CapsLock_d.png"
	},
	RSHIFT = {
		AUTO = "RShift_d.png"
	},
	COMMA = {
		AUTO = "Comma_d.png"
	},
	PERIOD = {
		AUTO = "Period_d.png"
	},
	SLASH = {
		AUTO = "ForwardSlash_d.png"
	},
	LCONTROL = {
		AUTO = "LCtrl_d.png"
	},
	LALT = {
		AUTO = "LAlt_d.png"
	},
	RALT = {
		AUTO = "RAlt_d.png"
	},
	APPS = {
		AUTO = "Apps_d.png"
	},
	RCONTROL = {
		AUTO = "RCtrl_d.png"
	},
	SCROLL = {
		AUTO = "Scroll_d.png"
	},
	PAUSE = {
		AUTO = "Pause_d.png"
	},
	END = {
		AUTO = "End_d.png"
	},
	DIVIDE = {
		AUTO = "Divide_d.png"
	},
	MULTIPLY = {
		AUTO = "Multiply_d.png"
	},
	SUBTRACT = {
		AUTO = "Subtract_d.png"
	},
	ADD = {
		AUTO = "Add_d.png"
	},
	DECIMAL = {
		AUTO = "Decimal_d.png"
	},
	NUMPADENTER = {
		AUTO = "NumPadEnter_d.png"
	},
	NUMPAD0 = {
		AUTO = "Num0_d.png"
	},
	NUMPAD1 = {
		AUTO = "Num1_d.png"
	},
	NUMPAD2 = {
		AUTO = "Num2_d.png"
	},
	NUMPAD3 = {
		AUTO = "Num3_d.png"
	},
	NUMPAD4 = {
		AUTO = "Num4_d.png"
	},
	NUMPAD5 = {
		AUTO = "Num5_d.png"
	},
	NUMPAD6 = {
		AUTO = "Num6_d.png"
	},
	NUMPAD7 = {
		AUTO = "Num7_d.png"
	},
	NUMPAD8 = {
		AUTO = "Num8_d.png"
	},
	NUMPAD9 = {
		AUTO = "Num9_d.png"
	},
	INSERT = {
		AUTO = "Ins_d.png"
	},
	HOME = {
		AUTO = "Home_d.png"
	},
	APOSTROPHE = {
		AUTO = "Apostrophe_d.png"
	},
	SEMICOLON = {
		AUTO = "Semicolon_d.png"
	},
	PLATINUM_CREDITS = {
		AUTO = "PlatinumCredits.png"
	},
	PRIME_BUCKS = {
		AUTO = "PrimeBucks.png"
	},
	FUSION_POINTS = {
		AUTO = "EndoIconRenderSmall.png"
	},
	CREDITS = {
		AUTO = "Credits.png"
	},
	HOLLARS = {
		AUTO = "1999Hollars.png"
	},
	KAHL_CREDS = {
		AUTO = "KahlCurrency.png"
	},
	COUPON = {
		AUTO = "Coupon.png"
	},
	STEEL_ESSENCE = {
		AUTO = "SteelEssence.png"
	},
	SESSION_INDICATOR = {
		AUTO = "SessionIndicator.png"
	},
	WARNING = {
		AUTO = "HandholdHelpIcon.png"
	},
	PROBLEM = {
		AUTO = "ProblemIcon64.png"
	},
	BIG_PROBLEM = {
		AUTO = "ProblemIcon64.png"
	},
	CONCLAVE = {
		AUTO = "Conclave_d.png"
	},
	UNIVERSAL = {
		AUTO = "UniversalIcon_d.png"
	},
	MOD_SELECTOR = {
		AUTO = "SelectedSlotIcon_d.png"
	},
	MOD_DUPLICATES = {
		AUTO = "IconDuplicate_d.png"
	},
	MINI_ARROW = {
		AUTO = "RightArrow.png"
	},
	PAGINATION_LAST = {
		AUTO = "PaginationLast_d.png"
	},
	PAGINATION_FIRST = {
		AUTO = "PaginationFirst_d.png"
	},
	PAGINATION_NEXT = {
		AUTO = "PaginationNext_d.png"
	},
	PAGINATION_PREVIOUS = {
		AUTO = "PaginationPrevious_d.png"
	},
	GAMEPAD_SWIPE_UP = {
		PS4 = "PS4SwipeUp_d.png",
		STEAM = "PadLeftDpadNorth.png"
	},
	GAMEPAD_SWIPE_DOWN = {
		PS4 = "PS4SwipeDown_d.png",
		STEAM = "PadLeftDpadSouth.png"
	},
	GAMEPAD_SWIPE_LEFT = {
		PS4 = "PS4SwipeLeft_d.png",
		STEAM = "PadLeftDpadWest.png"
	},
	GAMEPAD_SWIPE_RIGHT = {
		PS4 = "PS4SwipeRight_d.png",
		STEAM = "PadLeftDpadEast.png"
	},
	GAMEPAD_MOTION_PRESS = {
		PS4 = "PS4motion_press_d.png",
		STEAM = "PadLeftClick.png"
	},
	UPARROW = {
		AUTO = "IncreaseArrow.png"
	},
	DOWNARROW = {
		AUTO = "DecreaseArrow.png"
	},
	CONTROL = {
		AUTO = "Ctrl_d.png"
	},
	TOUCHPAD_SWIPE_UP = {
		AUTO = "PS4SwipeUp_d.png",
		STEAM = "PadLeftDpadNorth.png"
	},
	TOUCHPAD_SWIPE_DOWN = {
		AUTO = "PS4SwipeDown_d.png",
		STEAM = "PadLeftDpadSouth.png"
	},
	TOUCHPAD_SWIPE_LEFT = {
		AUTO = "PS4SwipeLeft_d.png",
		STEAM = "PadLeftDpadWest.png"
	},
	TOUCHPAD_SWIPE_RIGHT = {
		AUTO = "PS4SwipeRight_d.png",
		STEAM = "PadLeftDpadEast.png"
	},
	TOUCHPAD_MOTION_PRESS = {
		AUTO = "PS4motion_press_d.png",
		STEAM = "PadLeftClick.png"
	},
	DT_IMPACT = {
		AUTO = "Impact_d.png"
	},
	DT_IMPACT_COLOR = {
		AUTO = "ImpactSymbol.png"
	},
	DT_SLASH = {
		AUTO = "Slash_d.png"
	},
	DT_SLASH_COLOR = {
		AUTO = "SlashSymbol.png"
	},
	DT_PUNCTURE = {
		AUTO = "Puncture_d.png"
	},
	DT_PUNCTURE_COLOR = {
		AUTO = "PunctureSymbol.png"
	},
	DT_FIRE = {
		AUTO = "Heat_d.png"
	},
	DT_FIRE_COLOR = {
		AUTO = "HeatSymbol.png"
	},
	DT_FREEZE = {
		AUTO = "Cold_d.png"
	},
	DT_FREEZE_COLOR = {
		AUTO = "ColdSymbol.png"
	},
	DT_ELECTRICITY = {
		AUTO = "Electricity_d.png"
	},
	DT_ELECTRICITY_COLOR = {
		AUTO = "ElectricitySymbol.png"
	},
	DT_POISON = {
		AUTO = "Poison_d.png"
	},
	DT_POISON_COLOR = {
		AUTO = "ToxinSymbol.png"
	},
	DT_EXPLOSION = {
		AUTO = "Blast_d.png"
	},
	DT_EXPLOSION_COLOR = {
		AUTO = "BlastSymbol.png"
	},
	DT_RADIATION = {
		AUTO = "Radiation_d.png"
	},
	DT_RADIATION_COLOR = {
		AUTO = "RadiationSymbol.png"
	},
	DT_GAS = {
		AUTO = "Gas_d.png"
	},
	DT_GAS_COLOR = {
		AUTO = "GasSymbol.png"
	},
	DT_MAGNETIC = {
		AUTO = "Magnetic_d.png"
	},
	DT_MAGNETIC_COLOR = {
		AUTO = "MagneticSymbol.png"
	},
	DT_VIRAL = {
		AUTO = "Viral_d.png"
	},
	DT_VIRAL_COLOR = {
		AUTO = "ViralSymbol.png"
	},
	DT_CORROSIVE = {
		AUTO = "Corrosive_d.png"
	},
	DT_CORROSIVE_COLOR = {
		AUTO = "CorrosiveSymbol.png"
	},
	DT_SENTIENT = {
		AUTO = "SentientFactionIcon.png"
	},
	DT_FINISHER = {
		AUTO = "Finisher_d.png"
	},
	DT_CORROSIVE_COLOR_NO_ADV = {
		AUTO = "CorrosiveSymbol.png"
	},
	DT_ELECTRICITY_COLOR_NO_ADV = {
		AUTO = "ElectricitySymbol.png"
	},
	DT_EXPLOSION_COLOR_NO_ADV = {
		AUTO = "BlastSymbol.png"
	},
	DT_FIRE_COLOR_NO_ADV = {
		AUTO = "HeatSymbol.png"
	},
	DT_FREEZE_COLOR_NO_ADV = {
		AUTO = "ColdSymbol.png"
	},
	DT_GAS_COLOR_NO_ADV = {
		AUTO = "GasSymbol.png"
	},
	DT_IMPACT_COLOR_NO_ADV = {
		AUTO = "ImpactSymbol.png"
	},
	DT_MAGNETIC_COLOR_NO_ADV = {
		AUTO = "MagneticSymbol.png"
	},
	DT_POISON_COLOR_NO_ADV = {
		AUTO = "ToxinSymbol.png"
	},
	DT_PUNCTURE_COLOR_NO_ADV = {
		AUTO = "PunctureSymbol.png"
	},
	DT_RADIATION_COLOR_NO_ADV = {
		AUTO = "RadiationSymbol.png"
	},
	DT_RADIANT_COLOR_NO_ADV = {
		AUTO = "VoidSymbol.png"
	},
	DT_SLASH_COLOR_NO_ADV = {
		AUTO = "SlashSymbol.png"
	},
	DT_VIRAL_COLOR_NO_ADV = {
		AUTO = "ViralSymbol.png"
	},
	DT_VIRAL_TINT_COLOR_NO_ADV = {
		AUTO = "ViralSymbol.png"
	},
	STAT_NEGATIVE = {
		AUTO = "NegativeSymbol.png"
	},
	STAT_POSITIVE = {
		AUTO = "PositiveSymbol.png"
	},
	STAT_RESIST = {
		AUTO = "ResistSymbol.png"
	},
	AMMO_MUTATION = {
		AUTO = "AmmoMutation_d.png"
	},
	POLARITY_ATTACK = {
		AUTO = "PolarityTriangle.png"
	},
	POLARITY_DEFENSE = {
		AUTO = "PolarityPoint.png"
	},
	POLARITY_TACTIC = {
		AUTO = "PolarityCircle.png"
	},
	POLARITY_POWER = {
		AUTO = "PolarityMark.png"
	},
	POLARITY_PRECEPT = {
		AUTO = "PolarityPrecept.png"
	},
	POLARITY_FUSION = {
		AUTO = "PolarityAura.png"
	},
	POLARITY_WARD = {
		AUTO = "PolarityWard.png"
	},
	POLARITY_UMBRA = {
		AUTO = "PolarityUmbra.png"
	},
	POLARITY_ANY = {
		AUTO = "PolarityUniversal.png"
	},
	CHECKMARK = {
		AUTO = "Check_d.png"
	},
	CHECKMARK_OUTLINE = {
		AUTO = "CheckOutline_d.png"
	},
	CHECKMARK_FAIL = {
		AUTO = "CheckFailWhite_d.png"
	},
	CHECKMARK_NO_BORDER = {
		AUTO = "Checkmark.png"
	},
	CHECKMARK_FAIL_NO_BORDER = {
		AUTO = "X.png"
	},
	VENUS_ALERT_MID = {},
	VENUS_ALERT_FULL = {},
	MISSION_MARKER_GENERIC = {
		AUTO = "MiniMapObjective.png"
	},
	MISSION_MARKER_EXTRACTION = {
		AUTO = "MiniMapExtraction.png"
	},
	MISSION_MARKER_LOOT = {
		AUTO = "Loot.png"
	},
	MISSION_MARKER_ATTACK = {
		AUTO = "Attack.png"
	},
	MISSION_MARKER_A = {
		AUTO = "MiniMapTerritoryA.png"
	},
	MISSION_MARKER_B = {
		AUTO = "MiniMapTerritoryB.png"
	},
	MISSION_MARKER_C = {
		AUTO = "MiniMapTerritoryC.png"
	},
	MISSION_MARKER_D = {
		AUTO = "MiniMapTerritoryD.png"
	},
	MISSION_MARKER_E = {
		AUTO = "MiniMapTerritoryE.png"
	},
	MISSION_MARKER_F = {
		AUTO = "MiniMapTerritoryF.png"
	},
	ARTIFACT_MARKER_CIRCLE = {
		AUTO = "IconSentientCircle.png"
	},
	ARTIFACT_MARKER_DIAMOND = {
		AUTO = "IconSentientDiamond.png"
	},
	ARTIFACT_MARKER_SQUARE = {
		AUTO = "IconSentientSquare.png"
	},
	ARTIFACT_MARKER_TRIANGLE = {
		AUTO = "IconSentientTriangle.png"
	},
	ARTIFACT_MARKER_XATA = {
		AUTO = "DisruptionRuneTruthMinimap.png"
	},
	ARTIFACT_MARKER_VOME = {
		AUTO = "DisruptionRuneOrderMinimap.png"
	},
	ARTIFACT_MARKER_KHRA = {
		AUTO = "DisruptionRuneTimeMinimap.png"
	},
	ARTIFACT_MARKER_LOHK = {
		AUTO = "DisruptionRuneVoidMinimap.png"
	},
	KOUMEI_DICE_1 = {
		AUTO = "Die1.png"
	},
	KOUMEI_DICE_2 = {
		AUTO = "Die2.png"
	},
	KOUMEI_DICE_3 = {
		AUTO = "Die3.png"
	},
	KOUMEI_DICE_4 = {
		AUTO = "Die4.png"
	},
	KOUMEI_DICE_5 = {
		AUTO = "Die5.png"
	},
	KOUMEI_DICE_6 = {
		AUTO = "Die6.png"
	},
	NPC_EXIT_MARKER = {
		AUTO = "ExtractionIconWhite.png"
	},
	HIVE_MARKER = {
		AUTO = "HiveIcon.png"
	},
	SURVIVAL_PILLAR_MARKER = {
		AUTO = "O2PostHudStatusLarge.png"
	},
	SURVIVAL_PILLAR_OUTLINE_MARKER = {
		AUTO = "O2PostHudStatusLargeOutline.png"
	},
	FISURE_CANISTER_MARKER = {
		AUTO = "CanisterIconFull.png"
	},
	FISURE_CANISTER_MARKER_OUTLINE = {
		AUTO = "CanisterIconEmpty.png"
	},
	KUBROW_ADVENTURER = {
		AUTO = "TemperamentAdventurer.png"
	},
	KUBROW_GUARD = {
		AUTO = "TemperamentGuard.png"
	},
	KUBROW_HUNTER = {
		AUTO = "TemperamentHunter.png"
	},
	KUBROW_STEALTH = {
		AUTO = "TemperamentStealth.png"
	},
	KUBROW_INFESTED = {
		AUTO = "TemperamentCharger.png"
	},
	REPUTATION = {
		AUTO = "ReputationLarge128.png"
	},
	REPUTATION_SMALL = {
		AUTO = "ReputationSmall.png"
	},
	UGC = {
		AUTO = "UGCicon.png"
	},
	STEALTH_COMBO = {
		AUTO = "StealthCombo.png"
	},
	MOON_TEAM = {
		AUTO = "MiniMapPvpMoon.png"
	},
	SUN_TEAM = {
		AUTO = "MiniMapPvpSun.png"
	},
	MOON_TEAM_DROPPED = {
		AUTO = "MiniMapPvpMoonDropped.png"
	},
	SUN_TEAM_DROPPED = {
		AUTO = "MiniMapPvpSunDropped.png"
	},
	TIMER = {
		AUTO = "TradingTimerIcon.png"
	},
	TRADE_REQUEST_SENT_ICON = {
		AUTO = "HubTradingRequestSent.png"
	},
	SEEKING_TRADE_ICON = {
		AUTO = "HubTradingSeekingTrade.png"
	},
	IN_TRADE_ICON = {
		AUTO = "HubTradingTradeInProgress.png"
	},
	INFINITE = {
		AUTO = "InfiniteWhite.png"
	},
	INFINITE_SMALL = {
		AUTO = "InfiniteWhite.png"
	},
	QUEST = {
		AUTO = "Quest.png"
	},
	RAID = {
		AUTO = "RaidIconColour.png"
	},
	NIGHTMARE_RAID = {
		AUTO = "NightmareRaidIconColour.png"
	},
	ENHANCER = {
		AUTO = "GenericCosmeticEnhancerIcon.png"
	},
	ENHANCER_SMALL = {
		AUTO = "GenericCosmeticEnhancerIcon.png"
	},
	KUBROW_RETRIEVER = {
		AUTO = "TemperamentRetriever.png"
	},
	KAVAT_CHESHIRE = {
		AUTO = "TemperamentCheshire.png"
	},
	KAVAT_MIRROR = {
		AUTO = "TemperamentMirror.png"
	},
	KAVAT_INFESTED_ARMORED = {
		AUTO = "TemperamentPanzerVulpaphyla.png"
	},
	KAVAT_INFESTED_HORNED = {
		AUTO = "TemperamentCrescentVulpaphyla.png"
	},
	KAVAT_INFESTED_VULPINE = {
		AUTO = "TemperamentSlyVulpaphyla.png"
	},
	KUBROW_INFESTED_VIZIER = {
		AUTO = "TemperamentVizierPredasite.png"
	},
	KUBROW_INFESTED_MEDJAY = {
		AUTO = "TemperamentMedjayPredasite.png"
	},
	KUBROW_INFESTED_PHARAOH = {
		AUTO = "TemperamentPharaohPredasite.png"
	},
	ARCHWING = {
		AUTO = "IconArchwing_256.png"
	},
	SIMARIS = {
		AUTO = "CephalonSimaris.png"
	},
	SIMARIS_TEXTURED = {
		AUTO = "FactionSimarisTextured.png"
	},
	STEAM = {
		AUTO = "SteamIcon.png"
	},
	DISCORD = {
		AUTO = "DiscordIcon.png"
	},
	EPIC = {
		AUTO = "EpicIcon.png"
	},
	ACCOLADE_RANK_1 = {
		AUTO = "TemperamentHunter.png"
	},
	ACCOLADE_RANK_2 = {
		AUTO = "TemperamentStealth.png"
	},
	ACCOLADE_RANK_3 = {
		AUTO = "TemperamentStealth.png"
	},
	CHECKER_REALLY_SMALL = {
		AUTO = "CheckerBoard_d.png"
	},
	CHECKER_SMALL = {
		AUTO = "CheckerBoard_d.png"
	},
	CHECKER_MEDIUM = {
		AUTO = "CheckerBoard_d.png"
	},
	CHECKER_BIG = {
		AUTO = "CheckerBoard_d.png"
	},
	CHECKER_REALLY_BIG = {
		AUTO = "CheckerBoard_d.png"
	},
	GAMEPAD_GRIP_LEFT = {
		STEAM = "GripLeft.png"
	},
	GAMEPAD_GRIP_RIGHT = {
		STEAM = "GripRight.png"
	},
	MADURAI_ULTIMATE = {
		AUTO = "MaduraiUltimate.png"
	},
	MADURAI_BASE = {
		AUTO = "SealMaduraiCloudBase.png"
	},
	MADURAI = {
		AUTO = "SealMaduraiCloud.png"
	},
	MADURAI_GREATER = {
		AUTO = "SealMaduraiCloudGreater.png"
	},
	MADURAI_EIDOLON = {
		AUTO = "SealMaduraiCloudEidolon.png"
	},
	MADURAI_LUA = {
		AUTO = "SealMaduraiCloudLua.png"
	},
	NARAMON_ULTIMATE = {
		AUTO = "NaramonUltimate.png"
	},
	NARAMON_BASE = {
		AUTO = "SealNaramonTreeBase.png"
	},
	NARAMON = {
		AUTO = "SealNaramonTree.png"
	},
	NARAMON_GREATER = {
		AUTO = "SealNaramonTreeGreater.png"
	},
	NARAMON_EIDOLON = {
		AUTO = "SealNaramonTreeEidolon.png"
	},
	NARAMON_LUA = {
		AUTO = "SealNaramonTreeLua.png"
	},
	UNAIRU_ULTIMATE = {
		AUTO = "UnairuUltimate.png"
	},
	UNAIRU_BASE = {
		AUTO = "SealUnairuMountainBase.png"
	},
	UNAIRU = {
		AUTO = "SealUnairuMountain.png"
	},
	UNAIRU_GREATER = {
		AUTO = "SealUnairuMountainGreater.png"
	},
	UNAIRU_EIDOLON = {
		AUTO = "SealUnairuMountainEidolon.png"
	},
	UNAIRU_LUA = {
		AUTO = "SealUnairuMountainLua.png"
	},
	VAZARIN_ULTIMATE = {
		AUTO = "VazarinUltimate.png"
	},
	VAZARIN_BASE = {
		AUTO = "SealVazarinWaveBase.png"
	},
	VAZARIN = {
		AUTO = "SealVazarinWave.png"
	},
	VAZARIN_GREATER = {
		AUTO = "SealVazarinWaveGreater.png"
	},
	VAZARIN_EIDOLON = {
		AUTO = "SealVazarinWaveEidolon.png"
	},
	VAZARIN_LUA = {
		AUTO = "SealVazarinWaveLua.png"
	},
	ZENURIK_ULTIMATE = {
		AUTO = "ZenurikUltimate.png"
	},
	ZENURIK_BASE = {
		AUTO = "SealZenurikCrystalBase.png"
	},
	ZENURIK = {
		AUTO = "SealZenurikCrystal.png"
	},
	ZENURIK_GREATER = {
		AUTO = "SealZenurikCrystalGreater.png"
	},
	ZENURIK_EIDOLON = {
		AUTO = "SealZenurikCrystalEidolon.png"
	},
	ZENURIK_LUA = {
		AUTO = "SealZenurikCrystalLua.png"
	},
	FOCUS = {
		AUTO = "Focus.png"
	},
	ASCARIS_PRIME = {
		AUTO = "TwelveBossResourcePrimesItemSmall.png"
	},
	LYROIC_BRIDGE = {
		AUTO = "TwelveBossResourceHunhullusItemSmall.png"
	},
	REN_HYPERCORE = {
		AUTO = "TwelveBossResourceDactolystItemSmall.png"
	},
	SORTIE = {
		AUTO = "Sortie.png"
	},
	OMEGA = {},
	LUMINOUS = {
		AUTO = "LuminousIconSmall.png"
	},
	PROJECTION_T1 = {
		AUTO = "OroEpochA.png"
	},
	PROJECTION_T2 = {
		AUTO = "OroEpochB.png"
	},
	PROJECTION_T3 = {
		AUTO = "OroEpochC.png"
	},
	PROJECTION_T4 = {
		AUTO = "OroEpochD.png"
	},
	PROJECTION_IMMORTAL = {
		AUTO = "OroEpocImmortal.png"
	},
	LOCKED = {
		AUTO = "LockIcon.png"
	},
	TREASURE_GEM = {
		AUTO = "OrnamentIcon.png"
	},
	TREASURE_GEM_OUTLINE = {
		AUTO = "OrnamentIconOutline.png"
	},
	ARCANE_RANK = {
		AUTO = "DailyTributeFullDiamond.png"
	},
	ARCANE_RANK_OUTLINE = {
		AUTO = "DailyTributeOuterDiamondFaded.png"
	},
	AYATAN_SCULPTURE = {
		AUTO = "TreasuresIcon.png"
	},
	KUVA = {
		AUTO = "Kuva.png"
	},
	RESET = {
		AUTO = "Reset.png"
	},
	INFESTED_ADAPTATION = {
		AUTO = "InfestedRupture.png"
	},
	FULL_SERUM = {
		AUTO = "SyringeExtendedFull_d.png"
	},
	EMPTY_SERUM = {
		AUTO = "MiniMapTerritoryE.png"
	},
	MASTERED = {
		AUTO = "CodexObjectsLaurelWhite.png"
	},
	MASTERY_RANK = {
		AUTO = "MasteryRankIcon.png"
	},
	MASTERY_RANK_SMALL = {
		AUTO = "MasteryRankIconSmall.png"
	},
	MASTERY_RANK_LOCKED = {
		AUTO = "LockIconMarket.png"
	},
	NPC_COLONIST_MARKER = {
		AUTO = "UserIcon.png"
	},
	CLAN_XP = {
		AUTO = "ClanXpIcon_d.png"
	},
	RANK_0 = {
		AUTO = "Rank00Unranked.png"
	},
	RANK_1 = {
		AUTO = "Rank01Initiate.png"
	},
	RANK_2 = {
		AUTO = "Rank02SilverInitiate.png"
	},
	RANK_3 = {
		AUTO = "Rank03GoldInitiate.png"
	},
	RANK_4 = {
		AUTO = "Rank04Novice.png"
	},
	RANK_5 = {
		AUTO = "Rank05SilverNovice.png"
	},
	RANK_6 = {
		AUTO = "Rank06GoldNovice.png"
	},
	RANK_7 = {
		AUTO = "Rank07Disciple.png"
	},
	RANK_8 = {
		AUTO = "Rank08SilverDisciple.png"
	},
	RANK_9 = {
		AUTO = "Rank09GoldDisciple.png"
	},
	RANK_10 = {
		AUTO = "Rank10Seeker.png"
	},
	RANK_11 = {
		AUTO = "Rank11SilverSeeker.png"
	},
	RANK_12 = {
		AUTO = "Rank12GoldSeeker.png"
	},
	RANK_13 = {
		AUTO = "Rank13Hunter.png"
	},
	RANK_14 = {
		AUTO = "Rank14SilverHunter.png"
	},
	RANK_15 = {
		AUTO = "Rank15GoldHunter.png"
	},
	RANK_16 = {
		AUTO = "Rank16Eagle.png"
	},
	RANK_17 = {
		AUTO = "Rank17SilverEagle.png"
	},
	RANK_18 = {
		AUTO = "Rank18GoldEagle.png"
	},
	RANK_19 = {
		AUTO = "Rank19Tiger.png"
	},
	RANK_20 = {
		AUTO = "Rank20SilverTiger.png"
	},
	RANK_21 = {
		AUTO = "Rank21GoldTiger.png"
	},
	RANK_22 = {
		AUTO = "Rank22Dragon.png"
	},
	RANK_23 = {
		AUTO = "Rank23SilverDragon.png"
	},
	RANK_24 = {
		AUTO = "Rank24GoldDragon.png"
	},
	RANK_25 = {
		AUTO = "Rank25Sage.png"
	},
	RANK_26 = {
		AUTO = "Rank26SilverSage.png"
	},
	RANK_27 = {
		AUTO = "Rank27GoldSage.png"
	},
	RANK_28 = {
		AUTO = "Rank28Master.png"
	},
	RANK_29 = {
		AUTO = "Rank29MiddleMaster.png"
	},
	RANK_30 = {
		AUTO = "Rank30GrandMaster.png"
	},
	RANK_31 = {
		AUTO = "Rank31.png"
	},
	RANK_32 = {
		AUTO = "Rank32.png"
	},
	RANK_33 = {
		AUTO = "Rank33.png"
	},
	RANK_34 = {
		AUTO = "Rank34.png"
	},
	RANK_35 = {
		AUTO = "Rank35.png"
	},
	RANK_36 = {
		AUTO = "Rank36.png"
	},
	RANK_37 = {
		AUTO = "Rank37.png"
	},
	RANK_38 = {
		AUTO = "Rank38.png"
	},
	RANK_39 = {
		AUTO = "Rank39.png"
	},
	RANK_40 = {
		AUTO = "Rank40.png"
	},
	RANK_41 = {
		AUTO = "Rank41.png"
	},
	RANK_42 = {
		AUTO = "Rank42.png"
	},
	RANK_43 = {
		AUTO = "Rank43.png"
	},
	RANK_44 = {
		AUTO = "Rank44.png"
	},
	RANK_45 = {
		AUTO = "Rank45.png"
	},
	RANK_46 = {
		AUTO = "Rank46.png"
	},
	RANK_47 = {
		AUTO = "Rank47.png"
	},
	RANK_48 = {
		AUTO = "Rank48.png"
	},
	RANK_49 = {
		AUTO = "Rank49.png"
	},
	RANK_50 = {
		AUTO = "Rank50.png"
	},
	RANK_51 = {
		AUTO = "Rank51.png"
	},
	RADIAL_BUTTON_ON = {
		AUTO = "RadialButtonOn.png"
	},
	RADIAL_BUTTON_OFF = {
		AUTO = "RadialButtonOff.png"
	},
	GAMEPAD_HOME = {
		XBONE = "XboxOneXboxGuide_d.png",
		PS4 = "PS4_Home_d.png",
		STEAM = "ButtonSteamOff.png"
	},
	AMBULAS_DATA = {
		AUTO = "AmbulasDataFragments_d.png"
	},
	MOD_SET_FILLED_NOTCH = {
		AUTO = "FilledNotch.png"
	},
	MOD_SET_EMPTY_NOTCH = {
		AUTO = "EmptyNotch.png"
	},
	PERRIN = {
		AUTO = "FactionSigilBusiness.png"
	},
	LOKA = {
		AUTO = "FactionSigilChurch.png"
	},
	REDVEIL = {
		AUTO = "FactionSigilAssassins.png"
	},
	MERIDIAN = {
		AUTO = "FactionSigilRebels.png"
	},
	HEXIS = {
		AUTO = "FactionSigilJudge.png"
	},
	SUDA = {
		AUTO = "FactionSigilOracle.png"
	},
	VENTKIDS = {
		AUTO = "FactionVentKidz.png"
	},
	SOLARIS = {
		AUTO = "FactionSigilSolarisUnited.png"
	},
	LEGION = {
		AUTO = "RadioLegionSigil.png"
	},
	OSTRON_PRICE = {
		AUTO = "OstronBarterIconSmall.png"
	},
	ELITIUM = {
		AUTO = "Elitium.png"
	},
	MISSION_MARKER_DEFEND = {
		AUTO = "MiniMapDefenseObjectiveMarker.png"
	},
	DT_RADIANT = {
		AUTO = "Void_d.png"
	},
	DT_RADIANT_COLOR = {
		AUTO = "VoidSymbol.png"
	},
	INFINITY = {
		AUTO = "Infinity_d.png"
	},
	OWNED = {
		AUTO = "OwnedIcon.png"
	},
	CRAFTED = {
		AUTO = "BuildComplete.png"
	},
	MISSION_MARKER_ALERT = {
		AUTO = "MiniMapPanicButton.png"
	},
	PREVIEW = {
		AUTO = "PreviewIcon.png"
	},
	PREVIEW_LARGE = {
		AUTO = "PreviewIcon.png"
	},
	COMMON = {
		AUTO = "RarityIconCommon.png"
	},
	UNCOMMON = {
		AUTO = "RarityIconUncommon.png"
	},
	RARE = {
		AUTO = "RarityIconRare.png"
	},
	PLAYER = {
		AUTO = "IconOperator256.png"
	},
	VAULT = {
		AUTO = "VaultIcon.png"
	},
	WEEKLY = {
		AUTO = "WeeklyChallengeIcon.png"
	},
	NIGHTWAVE_PRESTIGE = {
		AUTO = "RadioLegionPrestige_d.png"
	},
	ENERGY = {
		AUTO = "Energy_d.png"
	},
	HEALTH = {
		AUTO = "Health_d.png"
	},
	SHIELD = {
		AUTO = "HildrynEnergyShield.png"
	},
	INC_ARROW = {
		AUTO = "IncreaseArrow.png"
	},
	DEC_ARROW = {
		AUTO = "DecreaseArrow.png"
	},
	NEUTRAL_SYNDICATE = {
		AUTO = "NeutralSyndicateIcon.png"
	},
	ALLY_DOWN = {
		AUTO = "MiniMapFriendPreDeath.png"
	},
	ARBITRATION_DRONE = {
		AUTO = "ArbitrationDrone.png"
	},
	LINE_SEPARATOR = {
		AUTO = "WhiteLine_d.png"
	},
	INFESTED = {
		AUTO = "InfestedLogo.png"
	},
	INTRINSIC = {
		AUTO = "Intrinsics.png"
	},
	INTRINSIC_DRIFTER = {
		AUTO = "IntrinsicsDrifter.png"
	},
	KUVA_LICH = {
		AUTO = "KuvaLichIconSimple.png"
	},
	CORPUS_LICH = {
		AUTO = "CorpusLichIconSimple.png"
	},
	INFESTED_LICH = {
		AUTO = "DuetIcon_d.png"
	},
	IOS_ABILITIES = {
		AUTO = "IOSAbilities_d.png"
	},
	IOS_ADS = {
		AUTO = "IOSADS_d.png"
	},
	IOS_CHAT = {
		AUTO = "IOSChat_d.png"
	},
	IOS_CROUCH = {
		AUTO = "IOSCrouch_d.png"
	},
	IOS_BULLET_JUMPING = {
		AUTO = "IOSBulletJumping_d.png"
	},
	IOS_SHOOT = {
		AUTO = "IOSShoot_d.png"
	},
	SCAN = {
		IOS = "IOSScan_d.png",
		ANDROID = "IOSScan_d.png"
	},
	IOS_KAITHE_JUMP = {
		AUTO = "IOSKaitheJump_d.png"
	},
	IOS_KAITHE_GALLOP = {
		AUTO = "IOSKaitheGallop_d.png"
	},
	IOS_KAITHE_DESCEND = {
		AUTO = "IOSKaitheDescend_d.png"
	},
	IOS_KAITHE_DASH = {
		AUTO = "IOSKaitheDash_d.png"
	},
	IOS_KAITHE_ASCEND = {
		AUTO = "IOSKaitheAscend_d.png"
	},
	IOS_DRAGHORIZ = {
		AUTO = "IOSDragHoriz_d.png"
	},
	IOS_DRAGVERT = {
		AUTO = "IOSDragVert_d.png"
	},
	IOS_GEAR = {
		AUTO = "IOSEmotes_d.png"
	},
	IOS_ESCMENU = {
		AUTO = "IOSESC_d.png"
	},
	IOS_EXPANDMAP = {
		AUTO = "IOSExpandMap_d.png"
	},
	IOS_MOVE = {
		AUTO = "IOSJoycon_d.png"
	},
	IOS_JUMP = {
		AUTO = "IOSJump_d.png"
	},
	IOS_MARKER = {
		AUTO = "IOSMarker_d.png"
	},
	IOS_MELEE = {
		AUTO = "IOSMelee_d.png"
	},
	IOS_MELEE_MODE = {
		AUTO = "IOSMeleeMode_d.png"
	},
	IOS_HEAVY_ATTACK = {
		AUTO = "IOSHeavyAttack_d.png"
	},
	IOS_BLOCK = {
		AUTO = "IOSBlock_d.png"
	},
	IOS_PRIMARYFIRE = {
		AUTO = "IOSShoot_d.png"
	},
	IOS_RELOAD = {
		AUTO = "IOSReload_d.png"
	},
	IOS_SECONDARYFIRE = {
		AUTO = "IOSSecondaryFire_d.png"
	},
	IOS_THROW = {
		AUTO = "IOSThrow_d.png"
	},
	IOS_SLIDE = {
		AUTO = "IOSSlide_d.png"
	},
	IOS_TAP = {
		AUTO = "IOSTap2_d.png"
	},
	IOS_HOLD = {
		AUTO = "IOSTap1_d.png"
	},
	IOS_USE = {
		AUTO = "IOSUse_d.png"
	},
	IOS_WAYPOINT = {
		AUTO = "IOSWaypoint_d.png"
	},
	IOS_DECO_ADVANCED_MODE_TOGGLE = {
		AUTO = "DecoAdvancedModeToggle.png"
	},
	IOS_DECO_CANCEL = {
		AUTO = "DecoCancel.png"
	},
	IOS_DECO_CAMERA_DOWN = {
		AUTO = "DecoCameraDown.png"
	},
	IOS_DECO_CAMERA_UP = {
		AUTO = "DecoCameraUp.png"
	},
	IOS_ABILITY_0 = {
		AUTO = "XboxOneDPadDown_d.png"
	},
	IOS_ABILITY_1 = {
		AUTO = "XboxOneDPadLeft_d.png"
	},
	IOS_ABILITY_2 = {
		AUTO = "XboxOneDPadRight_d.png"
	},
	IOS_ABILITY_3 = {
		AUTO = "XboxOneDPadUp_d.png"
	},
	IOS_EXCALIBUR_ABILITY_1 = {
		AUTO = "Power04_d.png"
	},
	IOS_EXCALIBUR_ABILITY_2 = {
		AUTO = "Power01_d.png"
	},
	IOS_EXCALIBUR_ABILITY_3 = {
		AUTO = "Power03_d.png"
	},
	IOS_EXCALIBUR_ABILITY_4 = {
		AUTO = "ExcaliburSwordOfDoom_d.png"
	},
	IOS_MAG_ABILITY_1 = {
		AUTO = "MagPull_d.png"
	},
	IOS_MAG_ABILITY_2 = {
		AUTO = "MagMagnetize_d.png"
	},
	IOS_MAG_ABILITY_3 = {
		AUTO = "MagShieldRenew_d.png"
	},
	IOS_MAG_ABILITY_4 = {
		AUTO = "MagCrush_d.png"
	},
	IOS_VOLT_ABILITY_1 = {
		AUTO = "VoltShock_d.png"
	},
	IOS_VOLT_ABILITY_2 = {
		AUTO = "VoltSuperSpeed_d.png"
	},
	IOS_VOLT_ABILITY_3 = {
		AUTO = "VoltShield_d.png"
	},
	IOS_VOLT_ABILITY_4 = {
		AUTO = "VoltOverLoad_d.png"
	},
	IOS_DUVIRI_ABILITY_1 = {
		AUTO = "DrifterAbilityIconHorseSummon_d.png"
	},
	IOS_DUVIRI_ABILITY_2 = {
		AUTO = "DrifterAbilityIconRadar_d.png"
	},
	IOS_DUVIRI_ABILITY_3 = {
		AUTO = "DrifterAbilityIconHealth_d.png"
	},
	IOS_DUVIRI_ABILITY_4 = {
		AUTO = "DrifterAbilityIconSmokescreen_d.png"
	},
	IOS_ARCHWING_UP = {
		AUTO = "IOSArchwingUp_d.png"
	},
	IOS_ARCHWING_DOWN = {
		AUTO = "IOSArchwingDown_d.png"
	},
	IOS_MOTORCYCLE_ABILITY_1 = {
		AUTO = "MotorcycleSpeedBoost.png"
	},
	IOS_MOTORCYCLE_ABILITY_2 = {
		AUTO = "MotorcycleDismountExplosion.png"
	},
	IOS_SUMMON_ATOMICYCLE = {
		AUTO = "IOSAtomicycleSpawn_d.png"
	},
	IOS_CALIBERCHICKS_DASH = {
		AUTO = "IOSMinigameCCDash_d.png"
	},
	IOS_CALIBERCHICKS_HOLDSHOOT = {
		AUTO = "IOSMinigameCCHoldShoot_d.png"
	},
	IOS_CALIBERCHICKS_JUMP = {
		AUTO = "IOSMinigameCCJump_d.png"
	},
	IOS_CALIBERCHICKS_SHOOT = {
		AUTO = "IOSMinigameCCShoot_d.png"
	},
	IOS_CALIBERCHICKS_ULTIMATE = {
		AUTO = "IOSMinigameCCUltimate_d.png"
	},
	CARGO = {
		AUTO = "RailjackResourceCompactorIcon.png"
	},
	AVIONICS_CAPACITY = {
		AUTO = "ModEnergyIcon.png"
	},
	SALVAGE = {
		AUTO = "RailjackSalvageIcon.png"
	},
	RAW_SALVAGE = {
		AUTO = "RailjackRawSalvageIcon.png"
	},
	CREW_SHIP_FUSION_POINTS = {
		AUTO = "AvionicEndo.png"
	},
	RAILJACK = {
		AUTO = "RailjackShipMarker.png"
	},
	DT_IMPACT_SPACE = {
		AUTO = "Ballistic_d.png"
	},
	DT_PUNCTURE_SPACE = {
		AUTO = "Plasma_d.png"
	},
	DT_SLASH_SPACE = {
		AUTO = "Energy_d.png"
	},
	DT_FIRE_SPACE = {
		AUTO = "Incendiary_d.png"
	},
	DT_FREEZE_SPACE = {
		AUTO = "Cold_d.png"
	},
	DT_ELECTRICITY_SPACE = {
		AUTO = "Ionic_d.png"
	},
	DT_POISON_SPACE = {
		AUTO = "Chem_d.png"
	},
	MANUFACTURER_LAVAN = {
		AUTO = "IconManufacturerLavan.png"
	},
	MANUFACTURER_VIDAR = {
		AUTO = "IconManufacturerVidar.png"
	},
	MANUFACTURER_ZEKTI = {
		AUTO = "IconManufacturerZekti.png"
	},
	ARCANE_CAN_REPROC = {
		AUTO = "RefreshTimerIcon.png"
	},
	OPLINK = {
		AUTO = "OplinkIcon.png"
	},
	GREED_BLACK = {
		AUTO = "GreedTokenBlack.png"
	},
	GREED_BLUE = {
		AUTO = "GreedTokenBlue.png"
	},
	GREED_GOLD = {
		AUTO = "GreedTokenGold.png"
	},
	MOD_BOOSTER = {
		AUTO = "ModDropChanceBoosterSmall.png"
	},
	RESOURCE_BOOSTER = {
		AUTO = "ResourceBoosterBlueSmall.png"
	},
	HELMINTH = {
		AUTO = "HelminthChrysalis.png"
	},
	SON_TOKEN = {
		AUTO = "EntratiTasksSonASmall.png"
	},
	DAUGHTER_TOKEN = {
		AUTO = "EntratiTasksDaughterASmall.png"
	},
	MOTHER_TOKEN = {
		AUTO = "EntratiTasksMotherASmall.png"
	},
	FATHER_TOKEN = {
		AUTO = "EntratiTasksFatherASmall.png"
	},
	GRANDMOTHER_TOKEN = {
		AUTO = "EntratiTasksGrandmotherASmall.png"
	},
	OTAK_TOKEN = {
		AUTO = "EntratiTasksOtakASmall.png"
	},
	NECRALOID_STANDING = {
		AUTO = "NecraloidStandingCommon.png"
	},
	UPGRADE = {
		AUTO = "MarketBundleUpgradeIcon.png"
	},
	ORPHIX_ICON = {
		AUTO = "MiniMapOrphix.png"
	},
	MECH_EVENT_CURRENCY = {
		AUTO = "MechModeEventCurrency.png"
	},
	SPECTATE = {
		AUTO = "SpectateIcon.png"
	},
	TELEPORT = {
		AUTO = "TeleportIcon.png"
	},
	LEGENDARY = {
		AUTO = "RarityIconLegendary.png"
	},
	ELITE_CREW_MEMBER = {
		AUTO = "EliteCrewMemberIcon.png"
	},
	OPTIONAL_OBJECTIVE = {
		AUTO = "OptionalObjective.png"
	},
	RIVEN_CIPHER = {
		AUTO = "RivenCipher.png"
	},
	LEGENDARY_RANK = {
		AUTO = "LegendaryIcon.png"
	},
	MOVE_Z_UP = {
		XBONE = "XboxOneJoystickLUp_d.png",
		PS4 = "AnalogStickLTiltUp_d.png",
		STEAM = "PadLeftDpadNorth.png",
		SWITCH = "SwitchLStickUp_d.png",
		IOS = "IOSStickUp_d.png",
		ANDROID = "IOSStickUp_d.png"
	},
	MOVE_Z_DOWN = {
		XBONE = "XboxOneJoystickLDown_d.png",
		PS4 = "AnalogStickLTiltDown_d.png",
		STEAM = "PadLeftDpadSouth.png",
		SWITCH = "SwitchLStickDown_d.png",
		IOS = "IOSStickDown_d.png",
		ANDROID = "IOSStickDown_d.png"
	},
	MOVE_X_LEFT = {
		XBONE = "XboxOneJoystickLLeft_d.png",
		PS4 = "AnalogStickLTiltLeft_d.png",
		STEAM = "PadLeftDpadWest.png",
		SWITCH = "SwitchLStickLeft_d.png",
		IOS = "IOSStickLeft_d.png",
		ANDROID = "IOSStickLeft_d.png"
	},
	MOVE_X_RIGHT = {
		XBONE = "XboxOneJoystickLRight_d.png",
		PS4 = "AnalogStickLTiltRight_d.png",
		STEAM = "PadLeftDpadEast.png",
		SWITCH = "SwitchLStickRight_d.png",
		IOS = "IOSStickRight_d.png",
		ANDROID = "IOSStickRight_d.png"
	},
	MISSION_MARKER_GRN = {
		AUTO = "ObjectiveMarker.png"
	},
	MISSION_MARKER_CRP = {
		AUTO = "ObjectiveMarker.png"
	},
	MISSION_MARKER_TSH = {
		AUTO = "TeshinObjectiveMarker.png"
	},
	MISSION_MARKER_DRFT = {
		AUTO = "ObjectiveMarker.png"
	},
	BOOKEND_LEFT = {
		AUTO = "HeadingDecoration.png"
	},
	BOOKEND_RIGHT = {
		AUTO = "HeadingDecorationRight.png"
	},
	PRIME_TOKEN = {
		AUTO = "PrimeToken.png"
	},
	IN_PROGRESS = {
		AUTO = "ResearchInProgress_d.png"
	},
	GILD = {
		AUTO = "GildedIcon.png"
	},
	MMF_WINDOWS = {
		XBONE = "GenericPlayerIcon_d.png",
		PS4 = "GenericPlayerIcon_d.png",
		PC = "Windows_d.png",
		SWITCH = "GenericPlayerIcon_d.png",
		IOS = "GenericPlayerIcon_d.png",
		ANDROID = "GenericPlayerIcon_d.png"
	},
	MMF_XBOX = {
		XBONE = "XboxOneXboxGuide_d.png",
		PS4 = "GenericPlayerIcon_d.png",
		PC = "GenericPlayerIcon_d.png",
		SWITCH = "GenericPlayerIcon_d.png",
		IOS = "GenericPlayerIcon_d.png",
		ANDROID = "GenericPlayerIcon_d.png"
	},
	MMF_PLAYSTATION = {
		XBONE = "GenericPlayerIcon_d.png",
		PS4 = "PlaystationIcon_d.png",
		PC = "GenericPlayerIcon_d.png",
		SWITCH = "GenericPlayerIcon_d.png",
		IOS = "GenericPlayerIcon_d.png",
		ANDROID = "GenericPlayerIcon_d.png"
	},
	MMF_SWITCH = {
		XBONE = "GenericPlayerIcon_d.png",
		PS4 = "GenericPlayerIcon_d.png",
		PC = "GenericPlayerIcon_d.png",
		SWITCH = "NintendoSwitch_d.png",
		IOS = "GenericPlayerIcon_d.png",
		ANDROID = "GenericPlayerIcon_d.png"
	},
	MMF_MOBILE = {
		XBONE = "GenericPlayerIcon_d.png",
		PS4 = "GenericPlayerIcon_d.png",
		SWITCH = "GenericPlayerIcon_d.png",
		PC = "GenericPlayerIcon_d.png",
		IOS = "AppleLogo_d.png",
		ANDROID = "GenericPlayerIcon_d.png"
	},
	MMF_ANDROID = {
		XBONE = "GenericPlayerIcon_d.png",
		PS4 = "GenericPlayerIcon_d.png",
		SWITCH = "GenericPlayerIcon_d.png",
		PC = "GenericPlayerIcon_d.png",
		IOS = "GenericPlayerIcon_d.png",
		ANDROID = "AndroidLogo_d.png"
	},
	CROSS_PLAY = {
		AUTO = "GenericPlayerIcon_d.png"
	},
	SHARD_RED_SIMPLE = {
		AUTO = "ArchonAmarIcon.png"
	},
	SHARD_BLUE_SIMPLE = {
		AUTO = "ArchonBorealIcon.png"
	},
	SHARD_YELLOW_SIMPLE = {
		AUTO = "ArchonNiraIcon.png"
	},
	SHARD_GREEN_SIMPLE = {
		AUTO = "ArchonCrystalGreenIcon.png"
	},
	SHARD_ORANGE_SIMPLE = {
		AUTO = "ArchonCrystalOrangeIcon.png"
	},
	SHARD_VIOLET_SIMPLE = {
		AUTO = "ArchonCrystalPurpleIcon.png"
	},
	ARMOR_SOLID = {
		AUTO = "ShieldSolid.png"
	},
	ARMOR_BROKEN = {
		AUTO = "ShieldBroken.png"
	},
	ARMOR_DISABLED = {
		AUTO = "ShieldDisabled.png"
	},
	ABANDON_X = {
		AUTO = "AbandonXStroke.png"
	},
	ABANDON_X_BACKER = {
		AUTO = "AbandonXBacker.png"
	},
	PLUS = {
		AUTO = "AddSlotIcon.png"
	},
	AFFINITY_SHARE = {
		AUTO = "Affinity.png"
	},
	PASSIVE_ABILITY = {
		AUTO = "PassiveAbilityIcon.png"
	},
	SOMACHORD = {
		AUTO = "MiniMapJukeboxFragment.png"
	},
	DUVIRI_UNBLOCKABLE = {
		AUTO = "UnblockableAttack.png"
	},
	DUVIRI_INTERRUPTABLE = {
		AUTO = "VulnToPistolShot.png"
	},
	DUVIRI_HIDDEN_CHEST = {
		AUTO = "DuviriHiddenChestIcon.png"
	},
	DT_IMPACT_OUTLINE = {
		AUTO = "Impact_d.png"
	},
	DT_SLASH_OUTLINE = {
		AUTO = "Slash_d.png"
	},
	DT_PUNCTURE_OUTLINE = {
		AUTO = "Puncture_d.png"
	},
	DT_FIRE_OUTLINE = {
		AUTO = "Heat_d.png"
	},
	DT_FREEZE_OUTLINE = {
		AUTO = "Cold_d.png"
	},
	DT_ELECTRICITY_OUTLINE = {
		AUTO = "Electricity_d.png"
	},
	DT_POISON_OUTLINE = {
		AUTO = "Poison_d.png"
	},
	DT_EXPLOSION_OUTLINE = {
		AUTO = "Blast_d.png"
	},
	DT_RADIATION_OUTLINE = {
		AUTO = "Radiation_d.png"
	},
	DT_GAS_OUTLINE = {
		AUTO = "Gas_d.png"
	},
	DT_MAGNETIC_OUTLINE = {
		AUTO = "Magnetic_d.png"
	},
	DT_VIRAL_OUTLINE = {
		AUTO = "Viral_d.png"
	},
	DT_CORROSIVE_OUTLINE = {
		AUTO = "Corrosive_d.png"
	},
	DT_RADIANT_OUTLINE = {
		AUTO = "Void_d.png"
	},
	DT_SENTIENT_OUTLINE = {
		AUTO = "Sentient_d.png"
	},
	SHIELD_GAIN = {
		AUTO = "Shield.png"
	},
	OVERGUARD_GAIN = {
		AUTO = "Overguard.png"
	},
	CRITICAL_AMP = {
		AUTO = "Exclaim_d.png"
	},
	LOTUS = {
		AUTO = "LotusLogo.png"
	},
	RECOVERY_ARROW = {
		AUTO = "RecoveryArrowDeux_d.png"
	},
	SPEED_UP_ARROW = {
		AUTO = "UpArrowAnimated_d.png"
	},
	DISTILL_POINTS = {
		AUTO = "DistillPoints.png"
	},
	CATEGORY_WARFRAME = {
		AUTO = "IconWarframe_256.png"
	},
	CATEGORY_RIFLE = {
		AUTO = "IconPrimaryWeaponRifle.png"
	},
	CATEGORY_SHOTGUN = {
		AUTO = "IconPrimaryWeaponShotgun.png"
	},
	CATEGORY_BOW = {
		AUTO = "IconPrimaryWeaponBow.png"
	},
	CATEGORY_MODULAR = {
		AUTO = "IconModularItem256.png"
	},
	CATEGORY_AMP = {
		AUTO = "IconAmp_256.png"
	},
	CATEGORY_MELEE = {
		AUTO = "IconMelee_256.png"
	},
	CATEGORY_PISTOL = {
		AUTO = "IconPistol_256.png"
	},
	CATEGORY_OPERATOR = {
		AUTO = "IconOperatorHead256.png"
	},
	IOS_TOUCH_LEFT_SIDE = {
		AUTO = "IOSTouchLeftLow.png"
	},
	IOS_TOUCH_RIGHT_SIDE = {
		AUTO = "IOSTouchRightLow.png"
	},
	GRENADE_ICON = {
		IOS = "GrenadeIcon.png",
		ANDROID = "GrenadeIcon.png"
	},
	COVER_ICON = {
		IOS = "GrineerHUDCoverIcon.png",
		ANDROID = "GrineerHUDCoverIcon.png"
	},
	MOA_BREACHER = {
		IOS = "CorpusDeployMoa.png",
		ANDROID = "CorpusDeployMoa.png"
	},
	MOA_DRONE = {
		IOS = "CorpusDeployMoaDrone.png",
		ANDROID = "CorpusDeployMoaDrone.png"
	},
	MOA_GUN = {
		IOS = "CorpusDeployMoaGun.png",
		ANDROID = "CorpusDeployMoaGun.png"
	},
	IOS_SWITCH_WEAPON = {
		AUTO = "IOSWeaponSwitch.png"
	},
	IOS_WEAPON_WIDGET_RIFLE = {
		AUTO = "IOSTutorialWeaponWidgetRifle_d.png"
	},
	IOS_WEAPON_WIDGET_BOW = {
		AUTO = "IOSTutorialWeaponWidgetBow_d.png"
	},
	TESHIN_COLD = {
		IOS = "TeshinAbilitiesCold.png",
		ANDROID = "TeshinAbilitiesCold.png"
	},
	TESHIN_ELECTRICITY = {
		IOS = "TeshinAbilitiesElectricity.png",
		ANDROID = "TeshinAbilitiesElectricity.png"
	},
	TESHIN_HEAT = {
		IOS = "TeshinAbilitiesHeat.png",
		ANDROID = "TeshinAbilitiesHeat.png"
	},
	TESHIN_GLAIVE = {
		IOS = "TeshinAbilitiesGlaive.png",
		ANDROID = "TeshinAbilitiesGlaive.png"
	},
	UNAIRU_ABILITY_2 = {
		IOS = "FocusIcon40.png",
		ANDROID = "FocusIcon40.png"
	},
	IOS_URIEL_ABILITY_3 = {
		AUTO = "UrielBrimstone_d.png"
	},
	VAZARIN_ABILITY_2 = {
		IOS = "FocusIcon43.png",
		ANDROID = "FocusIcon43.png"
	},
	Eximus_Burden = {
		AUTO = "BurdenHudIcon01.png"
	},
	Void_Implosion_Burden = {
		AUTO = "BurdenHudIcon02.png"
	},
	Movement_Damage_Burden = {
		AUTO = "BurdenHudIcon03.png"
	},
	Bleed_Burden = {
		AUTO = "BurdenHudIcon04.png"
	},
	Electric_Hazard_Burden = {
		AUTO = "BurdenHudIcon05.png"
	},
	Damage_On_Skill_Burden = {
		AUTO = "BurdenHudIcon06.png"
	},
	Energy_Drain_Burden = {
		AUTO = "BurdenHudIcon07.png"
	},
	Vampiric_Hunger_Burden = {
		AUTO = "BurdenHudIcon09.png"
	},
	MINI_DIAMOND = {
		AUTO = "PipDiamond_d.png"
	},
	CURSOR_BLINK = {
		AUTO = "CursorBlinkFlip_d.png"
	},
	CURSOR_STATIC = {},
	LOWER_IS_BETTER = {
		AUTO = "StatArrowUp_d.png"
	},
	DT_SENTIENT_COLOR = {
		AUTO = "SentientSymbol.png"
	},
	PICKUP_DOUBLED = {
		AUTO = "2XIcon.png"
	},
	ENTRATI_EYE = {
		AUTO = "EyeGlitchA.png"
	},
	STAT_BASE = {
		AUTO = "TinyBaseDiamond.png"
	},
	STAT_POS = {
		AUTO = "PositiveDiamond.png"
	},
	STAT_NEG = {
		AUTO = "NegativeDiamond.png"
	},
	IOS_PVPVE_BOOSTER = {
		AUTO = "IOSBooster_d.png"
	},
	IOS_NEW_INDICATOR = {
		AUTO = "ExclaimPendingMobile_d.png"
	},
	IOS_PVPVE_HINDRANCE = {
		AUTO = "IOSHindrance_d.png"
	},
	ARROW_LIST = {
		AUTO = "OpenListArrow.png"
	},
	IOS_WRAITH_ABILITY_0 = {
		AUTO = "WraithDeathsGrasp_d.png"
	},
	IOS_WRAITH_ABILITY_1 = {
		AUTO = "WraithSoulHarvest_d.png"
	},
	IOS_WRAITH_ABILITY_2 = {
		AUTO = "WraithDeadlyWall_d.png"
	},
	BOUNTY_FUNGI = {
		AUTO = "MysteryShroom256_d.png"
	},
	MADURAI_CLEAN = {
		AUTO = "FocusCleanMadurai_d.png"
	},
	NARAMON_CLEAN = {
		AUTO = "FocusCleanNaramon_d.png"
	},
	UNAIRU_CLEAN = {
		AUTO = "FocusCleanUnairu_d.png"
	},
	VAZARIN_CLEAN = {
		AUTO = "FocusCleanVazarin_d.png"
	},
	ZENURIK_CLEAN = {
		AUTO = "FocusCleanZenurik_d.png"
	}
}

for k, v in pairs(wikiCustomOverride) do
	data[k] = data[k] or {}
	
	for dit, img in pairs(v) do
		data[k][dit] = img
	end
end

return data
