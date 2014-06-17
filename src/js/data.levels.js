
namespace("PXTree.AchtzehnKnoten.Data.Levels",

[ { spots:
		[ { x: 50, y: 325
			, reachable: [1, 2]
			, start: { dir: 'west' }
			}
		
		, { x: 105, y: 123
			, reachable: [3]
			, event: { tags: ["open_sea"] }
			}
		
		, { x: 175, y: 486
			, reachable: [3], type: "island"
			, event: { tags: ["island"] }
			}
		
		, { x: 289, y: 257, type: "water"
			, reachable: [4, 5]
			, event: { tags: ["open_sea"] }
			}
		
		, { x: 408, y: 105
			, reachable: [5]
			, event: { name: "pirate_privateer" }
			}
		
		, { x: 477, y: 347
			, end: { dir: 'south', to: 1 }
			, event: { tags: ["open_sea", "atlantic"] }
			}
		]
	}

, { spots:
	[ { x: 50, y: 325
		, reachable: [2]
		, event: { tags: ["open_sea"] }
		}
	
	, { x: 105, y: 123
		, reachable: [0,3]
		, start: { dir: 'north' }
		}
	
	, { x: 175, y: 486
		, reachable: [3], type: "island"
		, event: { tags: ["island"] }
		}
	
	, { x: 289, y: 257, type: "water"
		, reachable: [4, 5]
		, event: { tags: ["open_sea"] }
		}
	
	, { x: 408, y: 105
		, reachable: [5]
		, event: { name: "pirate_privateer" }
		}
	
	, { x: 477, y: 347
		, end: { dir: 'east', to: 0 }
		, event: { tags: ["open_sea", "atlantic"] }
		}
	]
}
]

);