export interface int_ForumMessage {
forumId :number,
	userId : number
	date: Date
	parentForumId :number
	title :string
	message :string
	forumTypeId :number
	userEmail: string
	// AboutGuideId int constraint FK_Forum_AboutGuideId 
	// 					foreign key references Guides(GuideId),
	// AboutWalkingTrailId int constraint FK_Forum_WalkingTrail 
	// 					foreign key references WalkingTrail(WalkingTrailId),
	// AboutAttractionsId int constraint FK_Forum_AttractionsId 
	// 					foreign key references Attractions(AttractionsId),
	// AboutHostelsId int constraint FK_Forum_HostelsId 
	// 					foreign key references Hostels(HostelsId),
}
