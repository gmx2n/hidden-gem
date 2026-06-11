export default function ProfilePage() {
    return (
        <div className="m-2">
            <div className="">
                <button
                    className="btn btn-neutral btn-sm"
                    onClick={() => signOut()}
                >
                    Logout
                </button>
            </div>
            <div>
                <div>Your Profile</div>
            </div>
        </div>
    )
}