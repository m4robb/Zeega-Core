<?php

namespace Zeega\ExtensionsBundle\Parser\Youtube;

use Zeega\CoreBundle\Parser\Base\ParserAbstract;
use Zeega\DataBundle\Entity\Item;

use \DateTime;
use SimpleXMLElement;

class ParserYoutubeVideo extends ParserAbstract
{
	public function load($url, $parameters = null)
	{
	    $regexMatches = $parameters["regex_matches"];
	    $itemId = $regexMatches[1]; // bam
	    
		$originalUrl = 'http://gdata.youtube.com/feeds/api/videos/'.$itemId.'?alt=json&v=2';

		// read feed into SimpleXML object
		$videoInfo = json_decode(file_get_contents($originalUrl),true);
		$entry = $videoInfo["entry"];
		
		
		$item= new Item();
		
		// access control
		$accessControl = $entry["yt\$accessControl"];
		foreach($accessControl as $access)
		{
			if($access["action"] == "embed" && $access["permission"] != "allowed")
			{
				return $this->returnResponse($item, false, false, "This video is not embeddable and cannot be added to Zeega.");
			}
		}
		
		$item->setUri($itemId);
		$item->setTitle($entry["title"]["\$t"]);
		$item->setDescription($entry["media\$group"]["media\$description"]["\$t"]);
		$item->setAttributionUri($entry["media\$group"]["media\$player"]["url"]);
		$item->setMediaDateCreated($entry["published"]["\$t"]);
		$item->setDateCreated(new \DateTime("now"));
		$item->setMediaType('Video');
		$item->setLayerType('Youtube');
		$item->setChildItemsCount(0);
		$item->setThumbnailUrl($entry["media\$group"]["media\$thumbnail"][0]["url"]);
		
		$categories = $entry["category"];
        if(isset($categories)) 
		{
		    $itemTags = array();
		    foreach($categories as $cat)
			{
			    if($cat["term"] != "http://gdata.youtube.com/schemas/2007#playlist")
			    {
                    array_push($itemTags, $cat["term"]);
			    }
			}
			$item->setTags($itemTags);
		}
        
		$item->setMediaCreatorUsername($entry["author"][0]["name"]["\$t"]);
		$item->setMediaCreatorRealname('Unknown');

		// write metadata
		$item->setArchive('Youtube');
		$item->setLicense($entry["media\$group"]["media\$license"]["\$t"]);
		
		return $this->returnResponse($item, true, false);
	}
}
