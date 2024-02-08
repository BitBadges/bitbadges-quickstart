import { useAccount } from "@/redux/accounts/AccountsContext"
import { Spin, Tooltip, Typography } from "antd"
import {
  MINT_ACCOUNT,
  getAbbreviatedAddress,
  isAddressValid
} from "bitbadgesjs-utils"
import { useRouter } from "next/router"

const { Text } = Typography

export function Address({
  addressOrUsername,
  fontSize = 16,
  fontColor,
  hideTooltip,
  hidePortfolioLink,
  doNotShowName,
}: {
  addressOrUsername: string
  fontSize?: number | string
  fontColor?: string
  hideTooltip?: boolean
  hidePortfolioLink?: boolean
  doNotShowName?: boolean
}) {
  const router = useRouter()
  const userInfo = useAccount(addressOrUsername)

  const addressName = !doNotShowName ? userInfo?.username : ""
  const resolvedName = !doNotShowName ? userInfo?.resolvedName : ""
  let address = userInfo?.address || addressOrUsername || ""
  let chain = userInfo?.chain

  const isValidAddress = isAddressValid(address) || address == "All";
  const displayAddress = addressName ? addressName : resolvedName ? resolvedName : getAbbreviatedAddress(address)

  const innerContent =
    !hideTooltip && userInfo ? (
      <Tooltip
        placement="bottom"
        color="black"
        title={
          <>
            <div className="dark">
              {address === MINT_ACCOUNT.address ? (
                <div
                  className="primary-text"
                  style={{
                    textAlign: "center",
                  }}
                >
                  This is a special escrow address used when badges are first
                  created. Badges can only be transferred from this address, not
                  to it.
                </div>
              ) : address == "All" ? (
                <div
                  className="primary-text"
                  style={{
                    textAlign: "center",
                  }}
                >
                  This represents all possible user addresses.
                </div>
              ) : (
                <div
                  className="primary-text"
                  style={{
                    textAlign: "center",
                  }}
                >
                  {`${chain} Address`}
                  {resolvedName ? (
                    <>
                      <br />
                      {`${resolvedName}`}
                    </>
                  ) : (
                    ""
                  )}

                  <br />
                  <br />
                  {`${address}`}
                </div>
              )}
            </div>
          </>
        }
        overlayStyle={{
          minWidth: 320,
        }}
      >
        {displayAddress}
      </Tooltip>
    ) : (
      displayAddress
    )

  const showLink = !hidePortfolioLink &&
    address &&
    address !== MINT_ACCOUNT.address &&
    address != "All"
  const invalidAddress = !isValidAddress

  return (
    <div>
      <div
        style={{
          verticalAlign: "middle",
          paddingLeft: 5,
          fontSize: fontSize,
        }}
        className="whitespace-nowrap"
      >
        <Text
          className={"primary-text " + (!showLink ? "" : " link-button-nav")}
          onClick={
            !showLink
              ? undefined
              : () => {
                router.push(`/account/${address}`)
              }
          }
          copyable={{
            text: address,
            tooltips: ["Copy Address", "Copied!"],
          }}
          style={{
            color: invalidAddress ? "red" : fontColor,
            display: "inline-flex",
          }}
        >
          <b>
            {userInfo ? (
              <>{innerContent}</>
            ) : !invalidAddress ? (<Spin />) : (<>{displayAddress}</>)}
          </b>
        </Text>
      </div>
    </div>
  )
}
