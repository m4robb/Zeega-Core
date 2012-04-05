<?php

namespace Zeega\ExtensionsBundle\Parser\Dpla;

use Zeega\CoreBundle\Parser\Base\ParserAbstract;
use Zeega\DataBundle\Entity\Tag;
use Zeega\DataBundle\Entity\Item;
use Zeega\DataBundle\Entity\ItemTags;

use \DateTime;

class ParserDpla extends ParserAbstract
{
    public function load($url, $parameters = null)
    {

	
		$originalUrl = $url;

	
		$entry = json_decode(file_get_contents($originalUrl));
	
		
		$item= new Item();
		

	
		$volume=$entry->docs[0];
		
		$item->setUri((string)$url);
		
		$item->setTitle((string)$volume->title);
		$item->setDescription((string)$volume->description[0]);
		
		$item->setAttributionUri((string)$volume->content_link[0]);
		$item->setDateCreated(new \DateTime("now"));
		$item->setMediaType('DplaResource');
		$item->setLayerType('DplaResource');
		$item->setChildItemsCount(0);
		
		$authors=(array)$volume->creator;
		
		$item->setMediaCreatorUsername((string)$authors[0]);
		$item->setMediaCreatorRealname('Unknown');

		// write metadata
		$item->setArchive((string)$volume->organization_name);
		$item->setLicense('Unknown');
		$item->setThumbnailUrl('http://dp.la/files/2011/09/logo-blue.png');		
		/*
		$mainCategories = (string)$entry->volumeInfo->mainCategory;
		if(isset($mainCategories))
		{
		    $mainCategories = explode(" / ", $mainCategories);
			foreach($mainCategories as $category)
			{
			    $tag = new Tag;
			    $tag->setName($category);
                $tag->setDateCreated(new \DateTime("now"));
	            $item_tag = new ItemTags;
	            $item_tag->setItem($item);
	            $item_tag->setTag($tag);
	            $item_tag->setDateCreated(new \DateTime("now"));
                $item->addItemTags($item_tag);
			}
		}
	*/
		
		return $this->returnResponse($item, true, false);
		
		
		//else return $this->returnResponse($item, false, false, "This book cannot be embedded.");
		
			
	}
}
