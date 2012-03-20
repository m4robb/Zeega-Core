<?php
namespace Zeega\ApiBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\JsonEncoder;

use Zeega\DataBundle\Entity\ItemTags;
use Zeega\DataBundle\Entity\Item;
use Zeega\DataBundle\Entity\Site;
use Zeega\CoreBundle\Helpers\ResponseHelper;
use Zeega\CoreBundle\Helpers\ItemCustomNormalizer;
use Zeega\DataBundle\Repository\ItemTagsRepository;
use Doctrine\ORM\Query\ResultSetMapping;
use Zeega\ExtensionsBundle\Parser\AbsoluteUrl\ParserAbsoluteUrl;
use \ReflectionMethod;

class ParserController extends Controller
{
	private $supportedServices = array( 
		// flickr
		"#https?://(?:www\.)?flickr\.com/photos/[^/]+/([0-9]+)#" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\Flickr\ParserFlickrPhoto", "IsSet" => false),
		"#https?://(?:www\.)?flickr\.com/photos/[^/]+/sets/([0-9]+)#" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\Flickr\ParserFlickrSet", "IsSet" => true),
		
		// mapbox
		"#https?:\/\/(?:tiles\.)?mapbox.*\/([^/]+/map/[^/]+)#" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\Mapbox\ParserMapboxTiles", "IsSet" => false),
		
		// youtube
		"/http:\/\/(?:www\.)?youtube.*watch\?v=([a-zA-Z0-9\-_]+)/" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\Youtube\ParserYoutubeVideo", "IsSet" => false),
		"/http:\/\/(?:www\.)?youtube.*#p\/c\/([a-zA-Z0-9\-_]+)+/" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\Youtube\ParserYoutubePlaylist", "IsSet" => true),
		
		// soundcloud - order matters (last regex matches any soundlcoud url)
		"/http:\/\/(?:www\.)?soundcloud.com.*\/sets\/.*/" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\Soundcloud\ParserSoundcloudSet", "IsSet" => true),
		"/http:\/\/(?:www\.)?soundcloud.com.*/" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\Soundcloud\ParserSoundcloudItem", "IsSet" => false),
		
		// document cloud
		"/http:\/\/(?:www\.)?documentcloud.org\/documents.*/" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\DocumentCloud\ParserDocumentCloud", "IsSet" => false),
		
		// vimeo
		"/http:\/\/(?:www\.)?vimeo.com.*\/([a-zA-Z0-9\-_]+)/" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\Vimeo\ParserVimeoVideo", "IsSet" => false),
		
		
		// archive
		"/http:\/\/(?:www\.)?archive.org\/details.*/" => array("ParserClass" => "Zeega\ExtensionsBundle\Parser\InternetArchive\ParserInternetArchive", "IsSet" => false),
		
	);
	
	// get_tag_related   GET    /api/tags/{tagid}/related.{_format}
    public function getParserValidateAction()
    {
		$url = $this->getRequest()->query->get('url');
		$results = array("is_valid"=>false, "is_set"=>false);
		$matches = array();

		foreach ($this->supportedServices as $parserRegex => $parserInfo)
		{
			if (preg_match($parserRegex, $url, $matches)) 
			{
				if(count($matches) > 1)
				{
					$itemId = $matches[1];
				}
				else
				{
					$itemId = null;
				}
				
				$parserClass = $parserInfo["ParserClass"];
				$isSet = $parserInfo["IsSet"];
				
				if($isSet)
				{
					$parserMethod = new ReflectionMethod($parserClass, 'getInfo'); // reflection is slow, but it's probably ok here
				}
				else
				{
					$parserMethod = new ReflectionMethod($parserClass, 'getItem');
				}
				$response = $parserMethod->invokeArgs(new $parserClass, array($url,$itemId));

				if(isset($response))
				{
					$success = $response["success"] ? 'true' : 'false'; // twig wasn't rendering 'false' for some reason
					$item = $response["items"];
					$message = isset($response["message"]) ? $response["message"] : " ";
					
					$isSet = ($isSet) ? 'true' : 'false'; 
					
					$itemView = $this->renderView('ZeegaApiBundle:Import:info.json.twig', array('item' => $item, 'is_collection' => $isSet, 'is_valid' => $success, 'message' => $message));
			        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);
				}
			}
		}
		
		$parser = new ParserAbsoluteUrl;
        $response = $parser->getItem($url,null);
        $success = $response["success"] ? 'true' : 'false'; // twig wasn't rendering 'false' for some reason
		$item = $response["items"];
		$message = isset($response["message"]) ? $response["message"] : " ";
		
		$isSet = 'false'; 
        //return new Response(var_dump($response));
		
        // absolute URL or unsupported service
        $itemView = $this->renderView('ZeegaApiBundle:Import:info.json.twig', array('item' => $item, 'is_collection' => $isSet, 'is_valid' => $success, 'message' => $message));
        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);
    }
		
    // get_tag_related   GET    /api/tags/{tagid}/related.{_format}
    public function postParserPersistAction()
    {
		$url = $this->getRequest()->request->get('attribution_uri');
		
		$matches = array();
		$message = "";
		//return new Response($url);
		foreach ($this->supportedServices as $parserRegex => $parserInfo)
		{
			if (preg_match($parserRegex, $url, $matches)) 
			{
				if(count($matches) > 1)
				{
					$setId = $matches[1];
				}
				else
				{
				    $setId = null;
				}
				
				$user = $this->get('security.context')->getToken()->getUser();
				$em = $this->getDoctrine()->getEntityManager();
			
				$parserClass = $parserInfo["ParserClass"];
				$isSet = $parserInfo["IsSet"];
				
				$site = $this->getDoctrine()
						     ->getRepository('ZeegaDataBundle:Site')
						     ->findSiteByUser($user->getId());
				
				if($isSet)
				{
					$collection = new Item();
						
					$collection->setSite($site[0]);
							
					$collection->setTitle($this->getRequest()->request->get('title'));
					$collection->setDescription($this->getRequest()->request->get('description'));
			        $collection->setMediaType($this->getRequest()->request->get('media_type'));
			        $collection->setLayerType($this->getRequest()->request->get('layer_type'));
					$collection->setArchive($this->getRequest()->request->get('archive'));
			        $collection->setUser($user);
			        $collection->setUri($this->getRequest()->request->get('uri'));
			        $collection->setAttributionUri($this->getRequest()->request->get('attribution_uri'));
					$collection->setThumbnailUrl($this->getRequest()->request->get('thumbnail_url'));
			        $collection->setChildItemsCount($this->getRequest()->request->get('child_items_count'));
			        $collection->setDateCreated(new \DateTime("now"));
			        $collection->setMediaCreatorUsername($this->getRequest()->request->get('media_creator_username'));
			        $collection->setMediaCreatorRealname($this->getRequest()->request->get('media_creator_realname'));

					$parserMethod = new ReflectionMethod($parserClass, 'getCollection'); // reflection is slow, but it's probably ok here
					$response = $parserMethod->invokeArgs(new $parserClass, array($url, $setId, $collection));
					$collection = $response["items"];
				
					$collection->setUser($user);
					$collectionItems = $collection->getChildItems();
				
					foreach($collectionItems as $item)
			        {
						$item->setUser($user);
						$item->setSite($site[0]);
						$em->persist($item->getMetadata());
						$em->persist($item->getMedia());
						$em->flush();
						$em->persist($item);
						$em->flush();
					}
				
					$collection->setUser($user);
					
					$message = isset($response["message"]) ? $response["message"] : " ";
					
					$em->persist($collection);
					$em->flush();

					$itemView = $this->renderView('ZeegaApiBundle:Import:info.json.twig', array('item' => $collection, 'is_collection' => true, 'is_valid' => true, 'message' => $message));
			        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);
				}
				else
				{
					return $this->forward('ZeegaApiBundle:Items:postItems', array(), array());
				}
			}
		}

		$parser = new ParserAbsoluteUrl;
        $response = $parser->getItem($url,null);
        $success = $response["success"];

		if($success)
            return $this->forward('ZeegaApiBundle:Items:postItems', array(), array());
		
        // absolute URL or unsupported service
        $itemView = $this->renderView('ZeegaApiBundle:Import:info.json.twig', array('item' => $item, 'is_collection' => $isSet, 'is_valid' => $success, 'message' => $message));
        return ResponseHelper::compressTwigAndGetJsonResponse($itemView);
    }
}
