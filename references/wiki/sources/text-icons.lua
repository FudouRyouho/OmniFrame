---	'''TextIcons''' formats [[Text Icons|text icons]] closely to how they would look ingame.
--	
--	@module		TextIcons
--	@image		TooltipPic.png
--	@require	[[Module:Delay]]
--	@require	[[Module:TextIcons/data]]
--	@release	experimental
--	<nowiki>
local p = {}

local Delay = require([[Module:Delay]])
local TextIconsData = Delay.mw.loadData([[Module:TextIcons/data]])

local whitelist = {
	['b'] = '<b>', ['br'] = '<br>', ['i'] = '<i>',
	['LINE_SEPARATOR'] = '<hr />',
	['LOWER_IS_BETTER'] = '' -- Used in Mod fusion screen
}

--- Gets text with symbols replaced.
--  @function		p.getIcon
--  @param			{string} text text to convert
--	@param[opt]			{table} options table contains optional parameters
--	@param[opt]			{string} options.class css class to be included
--	@param[opt]			{string} options.platform specific platform (e.g. 'PC','IOS')
--	@param[opt]			{int} options.size height of the image
--  @return			{string} converted text
function p.getIcon(text, options)
	if text == nil or text == '' then return nil end
	
	options = options or {}
	local platform = options.platform and string.upper(options.platform) or nil
	local class = options.class
	local size = options.size

	return (text:gsub('<([%w_]+)>', function(key)
		if whitelist[key] then return whitelist[key] end
		
		local index = TextIconsData[key]
		
		if not index then
			return '<' .. key .. '>[[Category:Pages with raw TextIcons]]'
		end
		
		local image = index[platform] or index.AUTO or index.AGNOSTIC or
		error(('getIcon(text, options): TextIcon with text "%s" and platform "%s" does not exist in [[Module:TextIcons/data]]'):format(key or '<nil>', platform or '<nil>'))
		
		local result = '[[File:' .. image
		
		if class or index.Invert then
			result = result .. '|class=' .. (class or '') .. (index.Invert and ' light-invert' or '')
		end
		
		if size then
			result = result .. '|x' .. size .. 'px'
		end
		
		result = result .. ']]'
		
		return result
	end))
end

function p.main(frame)
	local args = frame.args or frame
	local text = args['Text'] or args[1]
	if not text or text == '' then error('No text input.') end
	
	local platform = args['Platform']
	local class = args['Class']
	local size = args['Size']
	
	return p.getIcon(text, {
		['platform'] = (platform ~= '' and platform) or nil,
		['class'] = (class ~= '' and class) or nil,
		['size'] = (size ~= '' and size) or nil
	})
end

return p
