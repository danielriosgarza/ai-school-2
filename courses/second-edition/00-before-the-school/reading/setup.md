# Setting up your computer

The school's notebooks run on your own laptop, from their pages on this site. On a notebook's page you press **Run on this computer**, and its cells run in Python on your laptop while the page stays open. This reading sets that up once, before the school. It takes about an hour, most of it downloads, and needs no experience with a terminal.

You need:

- a laptop with Windows 10 or 11, macOS 11 or newer, or Linux, on which you may install programs (a work laptop may need your IT department);
- about 1 GB of free space for Python, the environment and the setup notebook, and a few more for sessions that use PyTorch;
- Chrome, Edge or Firefox. Run on this computer has not been checked in Safari.

The steps:

1. Open a terminal.
2. Install Python.
3. Make a folder and an environment for the school, and install Jupyter in it.
4. Install the Parallax connector.
5. Run the setup notebook of this topic with Run on this computer.

Two sections follow them: one install line per session, and what to do when it does not work.

## 1. Open a terminal

A terminal is a window in which you type commands. Each command in this reading is in a grey box: type it, or copy and paste it, and press Enter. A command that works prints its result or nothing; one that fails prints an error.

- **Windows:** open the Start menu, type `PowerShell` and open **Windows PowerShell** (or **Terminal**).
- **macOS:** press Cmd and Space, type `Terminal` and press Enter.
- **Linux:** open **Terminal** from the applications menu (Ctrl+Alt+T on Ubuntu).

The terminal starts in your home folder.

## 2. Install Python

The school's notebooks are pinned for **Python 3.11, 3.12 or 3.13**. Python 3.14 and 3.15 are newer, but not every package the notebooks use installs on them yet, so do not take the newest Python that python.org offers first. This reading uses **Python 3.13.17**, the last 3.13 release with installers for Windows and macOS: the 3.13 releases after it, such as 3.13.18, are security fixes published as source code only.

**Windows**

1. Open <https://www.python.org/downloads/windows/>, find **Python 3.13.17** and download its **Windows installer (64-bit)**.
2. Run the file. On its first screen, tick **Add python.exe to PATH**, then choose **Install Now**.
3. Close PowerShell, open it again and check the version:

   ```
   py -3.13 --version
   ```

   It prints `Python 3.13.17`.

**macOS**

1. Open <https://www.python.org/downloads/macos/>, find **Python 3.13.17** and download its **macOS installer**.
2. Open the file and follow the installer.
3. In a new terminal, check the version:

   ```
   python3.13 --version
   ```

**Linux**

Most distributions come with a Python 3. Check its version:

```
python3 --version
```

If it prints 3.11, 3.12 or 3.13, use it. On Ubuntu and Debian, the environment of the next step also needs `sudo apt install python3-venv`. If your Python is older or newer, use conda, below.

**With conda instead**

If you already use conda (Anaconda, Miniconda or Miniforge), you can make the school's environment with it and skip the installer above and the `venv` lines of the next step:

```
conda create -n ai-school python=3.13
conda activate ai-school
```

Then continue at "Install Jupyter" in step 3, and wherever this reading says "activate the environment", run `conda activate ai-school`.

## 3. A folder and an environment for the school

A virtual environment is a folder with a Python of its own and the packages you install into it. The school's packages then stay apart from anything else on your computer.

Make a folder `ai-school` in your home folder, go into it, make the environment `venv` there and activate it.

**Windows** (PowerShell):

```
mkdir ai-school
cd ai-school
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS:**

```
mkdir ai-school
cd ai-school
python3.13 -m venv venv
source venv/bin/activate
```

**Linux:** the same as macOS, with `python3 -m venv venv` on the third line.

When the environment is active, the terminal's prompt starts with `(venv)`, and the commands `python` and `pip` are the environment's, on every system. Each time you open a new terminal for the school, go to the folder and activate the environment again: `cd ai-school`, then the last line above.

**Install Jupyter.** With the environment active:

```
python -m pip install --upgrade pip
pip install jupyter
```

The connector needs two parts of Jupyter: Jupyter Server and a Python kernel, `ipykernel`. `pip install jupyter` installs both, with JupyterLab, in which you can open your work later. If you want only what the connector needs, `pip install jupyter-server ipykernel` is enough. Check it:

```
jupyter server --version
```

It prints a version that starts with 2.

## 4. Install the Parallax connector

This site is built with Parallax. The Parallax connector is a small program that lets a notebook's page start Jupyter on your computer and run the cells there. It answers only on your own computer, at the address `127.0.0.1` and port `47821`, and asks you in its terminal before a site may use it.

Run on this computer needs connector **0.2.0** or newer; version 0.1.0 has no `open` command. The site does not check the version: the page only asks whether a connector answers. The connector is published on GitHub, in the releases of the Parallax repository: <https://github.com/danielriosgarza/PlatosCave/releases/tag/connector-v0.2.0>. There is one file for each kind of computer:

| Your computer | File |
| --- | --- |
| Windows | `parallax-connector_0.2.0_windows_amd64.exe` |
| Mac with an Apple chip (M1, M2 and later) | `parallax-connector_0.2.0_darwin_arm64` |
| Mac with an Intel processor | `parallax-connector_0.2.0_darwin_amd64` |
| Linux on most laptops (`uname -m` prints `x86_64`) | `parallax-connector_0.2.0_linux_amd64` |
| Linux on ARM (`uname -m` prints `aarch64`) | `parallax-connector_0.2.0_linux_arm64` |

On a Mac, the Apple menu, **About This Mac**, shows **Chip** (Apple) or **Processor** (Intel).

Download it into the `ai-school` folder, under the name `parallax-connector`, and check that it runs. In the terminal, in that folder:

**macOS**, with an Apple chip (for an Intel Mac, write `darwin_amd64` instead of `darwin_arm64`):

```
curl -fL -o parallax-connector https://github.com/danielriosgarza/PlatosCave/releases/download/connector-v0.2.0/parallax-connector_0.2.0_darwin_arm64
chmod +x parallax-connector
./parallax-connector version
```

**Linux** (on ARM, write `linux_arm64` instead of `linux_amd64`):

```
curl -fL -o parallax-connector https://github.com/danielriosgarza/PlatosCave/releases/download/connector-v0.2.0/parallax-connector_0.2.0_linux_amd64
chmod +x parallax-connector
./parallax-connector version
```

**Windows** (PowerShell; type `curl.exe`, since `curl` alone is another command there):

```
curl.exe -fL -o parallax-connector.exe https://github.com/danielriosgarza/PlatosCave/releases/download/connector-v0.2.0/parallax-connector_0.2.0_windows_amd64.exe
.\parallax-connector.exe version
```

It prints `parallax-connector 0.2.0`, the commit and your system. The `./` (or `.\` on Windows) means "the program in this folder".

On macOS, a file downloaded with a browser instead of `curl` is refused when you first run it; `xattr -d com.apple.quarantine parallax-connector` lifts that.

**Check the file (optional).** The connector is not signed, so your system or antivirus may warn about it. The release lists the SHA-256 checksum of each file in `SHA256SUMS`. Compute the checksum of yours with `shasum -a 256 parallax-connector` (macOS), `sha256sum parallax-connector` (Linux) or `Get-FileHash .\parallax-connector.exe` (Windows), and compare it with its line:

```
6829ad0862ae34a1a94b1d5c32ff00876b262e1587c653940ca064d4f13fe58d  parallax-connector_0.2.0_darwin_amd64
220a96f73898a337a323799d007a502e38f4dbb87ebf51eeb381ba822b46fb90  parallax-connector_0.2.0_darwin_arm64
a41a5efdadcd0723486e12d09047f945fdbae8c32e8f98adb56145f2f0d30e39  parallax-connector_0.2.0_linux_amd64
a6b5487c540f3ee73adbfe13acbb62b3bea73fb7e4b3dd86f6fe198c82311ca1  parallax-connector_0.2.0_linux_arm64
343cff70024564f0d214447b3f64928df703f25bf1df95bad047a4f3a404e4d6  parallax-connector_0.2.0_windows_amd64.exe
```

(Windows prints the checksum in capital letters; that is the same value.)

## 5. Run the setup notebook

1. In the terminal, in the `ai-school` folder with the environment active, start the connector:

   ```
   ./parallax-connector open
   ```

   On Windows: `.\parallax-connector.exe open`. It prints:

   ```
   parallax-connector 0.2.0 is open on http://127.0.0.1:47821 for course pages in this computer's browser.
   Each notebook gets a folder in /Users/you/Parallax.
   On a notebook's page, choose Run on this computer. Press Ctrl+C to stop.
   ```

   Leave this terminal open while you work. The connector runs the notebooks with the Jupyter of the environment that was active when you started it. Each notebook gets a folder of its own below `Parallax` in your home folder; to keep them elsewhere, start it with `--workspace` and a folder, such as `./parallax-connector open --workspace notebooks`.

2. In the browser, open this topic's **Notebooks** tab, with the notebook **Setup check**.
3. Press **Run on this computer**. A panel opens with these steps in short. Press **Connect**.
4. Your browser may ask whether this site may reach apps on this device. Allow it. This is the browser's one-time permission for the site: it lets the page talk to the connector at `127.0.0.1:47821`.
5. The connector's terminal asks:

   ```
   https://… asks to run notebooks on this computer, with your files and your Python.
   Answer y only if the page shows the code 1234-5678. Allow this page? [y/N]
   ```

   The page shows a code too. If it is the same code, type `y` and press Enter. The terminal asks again each time you load or reload a page. If you answer `n`, the connector refuses the site until you stop it and start it again.
6. The page shows "Starting Jupyter on this computer and copying the notebook's files…", then "Starting the kernel…", then the notebook with **This computer · Python · Ready** in its toolbar. Under it, the page says where the notebook's files are: "The notebook's files are in …/second-edition/Setup-check, in the connector's folder on this computer." The folder starts with the site's address and lies below `Parallax` in your home folder. The connector's terminal prints the whole folder, in a line that starts "Started Jupyter for".
7. Install the notebook's packages. Open a second terminal, go to the `ai-school` folder and activate the environment, as in step 3. Then go to the notebook's folder and install its `requirements.txt`:

   ```
   cd ~/Parallax/<the folder the page shows>
   pip install -r requirements.txt
   ```

   or `cd` and the whole folder that the connector printed. The installation takes a minute or so.

8. Back on the page, press **Run all** in the notebook's toolbar, or **Run** on each cell in turn. The cells run on your computer: the first prints your Python and system, the second the three packages, the third shows a table, the fourth a figure, the fifth writes and reads a file, and the last prints **Setup complete**.

Your computer is then ready for the school. When you are done, **Session**, then **Stop session**, stops the notebook's Jupyter and shows the saved outputs again; Ctrl+C in the connector's terminal stops the connector. Nothing you run or change on the page is saved on the site. The notebook's folder on your computer keeps its files, with the `setup_check_output.csv` that the fifth cell wrote; to keep your own work, open that folder in JupyterLab (`jupyter lab` in a terminal with the environment active).

## One install line per session

Every notebook of the school has a folder of its own name beside it, with a `requirements.txt` that pins the packages it imports. Run on this computer copies that file into the notebook's folder on your computer with the notebook and its data files, and the session's reading gives the install line:

```
pip install -r requirements.txt
```

For each session's notebook:

1. With the connector running, press **Run on this computer** on the notebook's page, then **Connect**, as in section 5.
2. In a second terminal with the environment active, go to the notebook's folder, as in step 7 of section 5, and run the install line.
3. Run the cells. If a cell still says that a module is missing, choose **Session**, then **Restart kernel**, and run the cells again.

**Work on your computer**, under each notebook, downloads the notebook with its data files as a zip, `requirements.txt` included, if you want to install before you connect or to work in your own Jupyter.

Some things to know:

- One environment for the whole school is simplest. If two sessions pin different versions of one package, pip replaces the first with the second. To keep both, make a second environment in another folder and start the connector from a terminal where that one is active.
- Some packages are large. scipy is a download of about 20 to 40 MB. PyTorch (`torch`) is about 125 MB on Windows and on a Mac with an Apple chip; on Linux, the package from PyPI is about 550 MB and pulls NVIDIA's GPU libraries on top. On a computer without an NVIDIA graphics card, install PyTorch's smaller CPU build first, at the version the `requirements.txt` pins, then the install line; for example `pip install torch==2.14.1 --index-url https://download.pytorch.org/whl/cpu`. PyTorch publishes no recent build for Macs with an Intel processor.
- The first edition's course on this site shows the convention: the topics *Computational design of synthetic microbial communities (Alex Fedorec)* and *Simulation and control of high-dimensional dynamical systems using artificial neural networks (Lucas Böttcher)* have one `requirements.txt` per notebook, and their readings give the install line, with PyTorch's CPU build in the second.

## When it does not work

While it connects, the page names the stage it waits for: the connector, your answer in its terminal, Jupyter and the notebook's files, the kernel. Where it stops tells you what to check.

- **"No connector answered on this computer."** The connector is not running, or it stopped. Start it as in section 5 and press **Connect** again. If you refused the browser's question, allow the site again in the browser's site settings (the icon to the left of the address), and reload the page.
- **The connector stops at once and says that port 47821 is in use.** Another connector already runs, perhaps in another terminal window. Use that one, or stop it with Ctrl+C there.
- **"The connector's terminal refused this site."** You answered `n`. Stop the connector with Ctrl+C, start it again, and press **Connect**.
- **"Nobody answered in the connector's terminal in time."** Press **Connect** again and answer `y` in the terminal.
- **"Jupyter Server is not installed in that environment."**, or the connector says that it cannot find Jupyter. The connector was started in a terminal where the environment was not active. Stop it with Ctrl+C, activate the environment, and start it again. `./parallax-connector doctor` (`.\parallax-connector.exe doctor` on Windows) checks what it needs: with the environment active, its lines `jupyter` and `kernels` read `ok`. Its lines about pairing, the server, the clock and the SSH agent concern sites with sign-in, which this one is not, and may say `warn`.
- **"Jupyter exited while starting."** The connector's terminal shows Jupyter's own lines, which start with `jupyter:`; the last of them usually names the problem.
- **The second cell says "Not installed in this Python".** The packages went into another Python. Run the install line in a terminal where the same environment is active as in the connector's, then run the cell again.
- **pip says "No matching distribution found", or starts to build a package for minutes.** Your Python is newer or older than the notebooks' pins; the first cell of the setup notebook says which Python runs. Make the environment again with Python 3.13.
- **Windows refuses to activate the environment: "running scripts is disabled on this system".** Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, answer `Y`, and activate again.
- **Your laptop does not allow the connector.** Ask your IT department, or use the other ways each notebook's page offers: read the saved outputs, **Work on your computer** to run it in your own Jupyter or on a cluster, or **Open in Colab**.

Questions about the setup: write to the organisers at schoolaisaclay@gmail.com. Say which system you use, what the page and the connector's terminal show, and which command you typed.
