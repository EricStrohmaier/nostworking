/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FC, useEffect, useState } from "react";
import LayoutPage from "../../components/LayoutPage";
import FeedNavbar from "../../components/FeedNavbar";
import LayoutCardComponent from "../../components/LayoutCard";
import ActionButton from "../../components/CommonUI/ActionButton";
import { globe } from "../../icons";
import { Dialog, Transition } from "@headlessui/react";
import { useTheme } from "../../logic/theme/useTheme";
import {
  readFollowing,
  readListEvents,
} from "../../logic/contextStore/saveEventInDexie";
import { useNDK } from "@nostr-dev-kit/ndk-react";
import { useCustomLists } from "../../logic/contextStore/getLists";
import { nip19 } from "nostr-tools";
import { useLocalUser } from "../../logic/contextStore/UserContext";

interface HomeProps {}

const Home: FC<HomeProps> = () => {
  const { darkMode } = useTheme();
  const backgroundstyle = darkMode
    ? "bg-primaryDark text-textDark"
    : "bg-primaryLight text-textLight";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [following, setFollowing] = useState<string[] | undefined>(undefined);
  // const [listsState, setListsState] = useState<string[] | undefined>(undefined);
  const [listName, setListName] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [selectedList, setSelectedList] = useState();
  console.log(userProfiles);
  
  const { userData } = useLocalUser();
  const { getUser } = useNDK();
  const hex = userData?.npub
    ? nip19.decode(userData?.npub).data.toString()
    : '';
    // : nip19.decode("npub1zuuajd7u3sx8xu92yav9jwxpr839cs0kc3q6t56vd5u9q033xmhsk6c2uc").data.toString();
  //get all the lists from the user
  useCustomLists(hex);

  const openModal = async () => {
    const allListEvents = await readListEvents();
    //@ts-ignore
    setListName(allListEvents);
    const resolvedUserProfiles = await getUserProfiles(following);
    //@ts-ignore
    setUserProfiles(resolvedUserProfiles);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  //@ts-ignore
  const handleListClick = (list) => {
    console.log("List:", list);
    setSelectedList(list);
    //return p tags within the list and get feed from that .... and set int state to render feed 
  };

  //@ts-ignore
  async function getUserProfiles(following) {
    try {
      //@ts-ignore
      const userDataPromises = following?.map((entry) => {
        const user = getUser(entry);
        return user?.profile;
      });

      // Wait for all promises to resolve
      const userData = await Promise.all(userDataPromises);
      if (userData) {
        return userData;
      }
    } catch (error) {
      console.error("Error fetching user profiles:", error);
      throw error;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const followingData = await readFollowing();
        setFollowing(followingData);
        // Assuming getUserProfiles returns a Promise
        if (followingData) {
          const resolvedUserProfiles = await getUserProfiles(followingData);
          //@ts-ignore
          setUserProfiles(resolvedUserProfiles);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); 
  
  // if (userData === null) {
  return (
    <LayoutPage>
      <FeedNavbar>
        <ActionButton title={`Edit feed`} svg={globe} onClick={openModal} />
      </FeedNavbar>
      <div className="flex flex-col items-center w-full">
        <LayoutCardComponent>
          <div className="flex justify-center w-full h-96">
            <div className="my-5 text-2xl font-extrabold">
              Focusing leads to Success
            </div>
          </div>
        </LayoutCardComponent>{" "}
      </div>

      {/* popup module  */}
      <Transition show={isModalOpen}>
        <Dialog onClose={closeModal}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-70" />

            <div
              className={`${backgroundstyle} z-50 m-5 p-6 rounded-[40px] shadow-xl lg:max-w-[55%] w-full min-h-[60%] h-[95%] overflow-y-auto`}
            >
              <div className="w-full">
                <div className="flex justify-center mb-4 text-lg font-medium lg:text-2xl">
                  Choose one of your contact lists to set your feed or create a
                  new list
                </div>
                <div>Create New People list from your followers</div>
                <div>Current selected Feed</div>
                <div className="text-md">
                  {following ? (
                    <div className="flex flex-col w-full gap-2 ">
                      <div className="flex h-full">
                        <div className="p-3 w-[100%] min-h-full h-full overflow-y-auto">
                          <div className="flex flex-col gap-2 border-2 border-red-900">
                            {/*  eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {listName?.map((entry: { tags?: Array<[string, any]> }, index) => {
                              // Check if the entry has the 'tags' property
                              if (entry.tags) {
                                // Find the title, description, and category tags in the 'tags' array
                                const title = entry.tags.find(
                                  (tag) => tag[0] === "title"
                                );
                                const name = entry.tags.find(
                                  (tag) => tag[0] === "name"
                                );
                                const description = entry.tags.find(
                                  (tag) => tag[0] === "description"
                                );
                                const category = entry.tags.find(
                                  (tag) => tag[0] === "l"
                                );

                              

                                return (
                                  <div
                                    key={index}
                                    className={`flex items-center gap-2 ${
                                      selectedList === entry
                                        ? "border-2 border-blue-500"
                                        : ""
                                    }`}
                                    onClick={() => handleListClick(entry)}
                                  >
                                    <div className="p-2 bg-gray-400 rounded-2xl">
                                      {title ? <p>List Title: {title[1]}</p>  : null}
                                      {name ? <p>List Title: {name[1]}</p>  : null}
                                        {description? <p>Description: {description[1]}</p>  : null}
                                      {category ? <p>Category: {category[1]}</p> : null}
                                    </div>
                                  </div>
                                );
                              }

                              return null; // Render nothing if 'tags' property is not present
                            })}
                          </div>
                        </div>

                        {/* <div className="w-full h-full overflow-y-auto border-2 border-red-900">
                          <div className="p-3">
                            {userProfiles.map((user, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                                <div>{user?.name}</div>
                              </div>
                            ))}
                          </div>
                        </div> */}
                      </div>
                    </div>
                  ) : (
                    <div>Loading</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </LayoutPage>
  );
};

export default Home;
