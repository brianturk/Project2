SELECT
	a.storyId,
	a.userId,
    a.userEmail,
    a.userOrderNum,
    b.firstName,
	ifnull(numEntries,0) as numEntries
FROM 
	storyPassdb.Contributors as a
		left join
	(select
			b.storyId,
			c.email,
            c.firstName,
			count(*) as numEntries
		from
			storyPassdb.Paragraphs as b
				left join
			storyPassdb.Users as c
				on
				b.userId = c.id
		where
			b.storyId = 3
		group by
			b.storyId,
			c.email,
            c.firstName) as b
		on
		a.storyId = b.storyId
		and a.userEmail = b.email
where
	a.storyId = 3
order by
	ifnull(numEntries,0),
    userOrderNum
limit 1

